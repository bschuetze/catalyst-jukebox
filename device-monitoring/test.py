import paho.mqtt.client as mqtt

GLOBAL_TOPIC = "catalyst-jukebox_global"
PAGER_TOPICS = []
CLIENT_ID = "catalyst-jukebox_MAIN"

def on_connect(client, userdata, flags, rc):
    print("MQTT connected with code: " + rc)
    client.subscribe(GLOBAL_TOPIC)
    client.subscribe("$SYS/#")



def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))


client = mqtt.Client(client_id=CLIENT_ID)
client.on_connect = on_connect
client.on_message = on_message

client.connect_async("192.168.0.5", 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()
