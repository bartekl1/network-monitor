from scapy.all import ARP, Ether, srp

import json


def split_ip(ip):
    return tuple(int(part) for part in ip.split('.'))


def get_sort_key(item):
    return split_ip(item['ip'])


with open("configs.json") as file:
    configs = json.load(file)

target_ip = configs["network_address"]
arp = ARP(pdst=target_ip)
ether = Ether(dst="ff:ff:ff:ff:ff:ff")
packet = ether/arp

result = srp(packet, timeout=3, verbose=0)[0]

clients = []

for sent, received in result:
    clients.append({'ip': received.psrc, 'mac': received.hwsrc})

clients = sorted(clients, key=get_sort_key)

print("IP" + " "*18+"MAC")
for client in clients:
    print("{:16}    {}".format(client['ip'], client['mac']))
