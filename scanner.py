from scapy.all import ARP, Ether, srp
import mysql.connector

import json

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

    for client in clients:
        if client['mac'] not in mac_addresses:
            cursor.execute("INSERT INTO hosts (ip_address, mac_address) VALUES (%s, %s)", [client['ip'], client['mac']])
        else:
            cursor.execute("UPDATE hosts SET last_detected = CURRENT_TIMESTAMP(), ip_address = %s WHERE mac_address = %s", [client['ip'], client['mac']])

    db.commit()
    cursor.close()
    db.close()


if __name__ == '__main__':
    main()
