from scapy.all import ARP, Ether, srp
import mysql.connector
import requests

import json
import time

with open("configs.json") as file:
    configs = json.load(file)


def main():
    target_ip = configs["network_address"]
    arp = ARP(pdst=target_ip)
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether/arp

    result = srp(packet, timeout=3, verbose=0)[0]

    clients = []

    for sent, received in result:
        clients.append({'ip': received.psrc, 'mac': received.hwsrc})

    clients = sorted(clients, key=lambda item: tuple(int(part) for part in item['ip'].split('.')))

    db = mysql.connector.connect(**configs['mysql'])
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT mac_address FROM hosts")
    hosts_in_database = cursor.fetchall()
    mac_addresses = [host['mac_address'] for host in hosts_in_database]

    new_hosts = []
    known_hosts = []

    for client in clients:
        if client['mac'] not in mac_addresses:
            new_hosts.append([client['ip'], client['mac']])
        else:
            known_hosts.append([client['ip'], client['mac']])

    cursor.executemany("INSERT INTO hosts (ip_address, mac_address) VALUES (%s, %s)", new_hosts)
    cursor.executemany("UPDATE hosts SET last_detected = CURRENT_TIMESTAMP(), ip_address = %s WHERE mac_address = %s", known_hosts)

    cursor.execute("SELECT * FROM hosts WHERE manufacturer IS NULL")
    hosts_to_update = []
    for host in cursor.fetchall():
        try:
            r = requests.get(f'https://api.macvendors.com/{host["mac_address"]}')
            if r.status_code == 200:
                hosts_to_update.append([r.text, host["mac_address"]])
            elif r.status_code == 404:
                hosts_to_update.append(["", host["mac_address"]])
        except Exception:
            pass
        time.sleep(1.5)
    cursor.executemany("UPDATE hosts SET manufacturer = %s WHERE mac_address = %s", hosts_to_update)

    db.commit()
    cursor.close()
    db.close()


if __name__ == '__main__':
    main()
