var CryptoJS = require('crypto-js');
import {Buffer} from 'buffer';
var dgram = require('react-native-udp');
var aesjs = require('aes-js');
import {NetworkInfo} from 'react-native-network-info';
import Config from 'react-native-config';
global.Buffer = Buffer; // very important

export default class ServiceDiscoveryClient {
  constructor() {
    if (ServiceDiscoveryClient.instance instanceof ServiceDiscoveryClient) {
      return ServiceDiscoveryClient.instance;
    }
    this.port = 50000;
    this.serviceName = Config.BROKER_DISCOVERY_USER;
    this.password = aesjs.utils.utf8.toBytes(
      this.prepare_text(Config.BROKER_DISCOVERY_PASS),
    );
    this.retryCount = 0;
    this.responded = false;
    this.broadcastSocket = null;
    this.installation_id = null;
    ServiceDiscoveryClient.instance = this;
  }

  discover(installationId, service, foundCallback, errorCallback) {
    this.installation_id = installationId;
    this.serviceName = service;
    this.retryCount = 0;
    this.responded = false;
    this.foundCallback = foundCallback;
    this.errorCallback = errorCallback;
    this.found = false;
    this.discovery(this.installation_id, this.service);
  }

  prepare_text(password) {
    if (password.length < 32) {
      return password.padEnd(32, '0');
    } else {
      return password.slice(0, 32);
    }
  }

  crypt(message = '') {
    var textBytes = aesjs.utils.utf8.toBytes(message);
    var aesCtr = new aesjs.ModeOfOperation.ctr(
      this.password,
      new aesjs.Counter(1),
    );
    var encryptedBytes = aesCtr.encrypt(textBytes);
    return encryptedBytes;
  }

  decrypt(message = '') {
    var aesCtr = new aesjs.ModeOfOperation.ctr(
      this.password,
      new aesjs.Counter(1),
    );
    var decryptedBytes = aesCtr.decrypt(message);

    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

    var decryptedMessage = decryptedText.toString(CryptoJS.enc.Utf8);

    return decryptedMessage;
  }

  getMagicString = () => {
    return '' + this.installation_id + '-' + this.serviceName;
  };

  discovery(installation_id, serviceName) {
    if (this.serviceName === 'coreservice-rest') {
      return this.foundCallback({port: 6031, address: '172.20.10.2'});
    } else {
      return this.foundCallback({port: 7031, address: '172.20.10.2'});
    }
    // if (Config.local_ip) {
    //   if (this.serviceName === 'coreservice-rest') {
    //     return this.foundCallback({
    //       port: 6031,
    //       address: Config.local_ip.toString(),
    //     });
    //   } else {
    //     return this.foundCallback({
    //       port: 7031,
    //       address: Config.local_ip.toString(),
    //     });
    //   }
    // }
    var remotePort = 50000;
    var remoteHost = '0.0.0.0';
    var broker_ip = null;
    this.found = false;

    if (!this.broadcastSocket) {
      this.broadcastSocket = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true,
      });

      this.broadcastSocket.bind(remotePort, remoteHost, (err) => {
        if (err) {
        }
      });

      this.broadcastSocket.on('message', (msg, rinfo) => {
        msg = this.decrypt(msg);
        const magic = this.getMagicString();
        if (msg.includes(magic)) {
          //log.debug("Got service announcement from '%s' with response: %s" % ("%s:%s" % addr, msg_details))

          if (msg.includes('#ERROR#')) {
            var error_details = ''; //msg_details[len("#ERROR#"):]

            //# log.debug("Response from server: %s" % error_details)

            if ('timestamp' in error_details) {
              throw error_details;
            } else if ('password' in error_details) {
              throw error_details;
            }
          } else if (msg.includes('#OK#')) {
            // EX. 1-coreservice-rest#OK#{"port": 0000, "address": "192.168.0.1"}
            if (msg.includes(this.serviceName)) {
              const payloadString = msg.split('#OK#').pop();
              const payload = JSON.parse(payloadString);
              if (!this.responded) {
                this.foundCallback(payload);
              }
              this.found = true;
            } else {
            }
          }
        } else {
        }
      });

      this.broadcastSocket.once('listening', () => {
        if (!this.found) {
          const magic = this.getMagicString();
          this.send_try(magic, this.broadcastSocket, remotePort);
        }
      });
    } else {
      const magic = this.getMagicString();
      this.send_try(magic, this.broadcastSocket, remotePort);
    }
  }

  send_try(magic, broadcastSocket, remotePort) {
    if (this.retryCount >= 10) {
      if (!this.responded) {
        this.errorCallback();
      }
      this.retryCount = 0;
      return;
    }
    if (this.found) {
      return;
    }
    this.retryCount++;
    try {
      var timestamp = Math.floor(Date.now() / 1000);
      var msg = '' + magic + '' + timestamp;
      this.send_data(broadcastSocket, remotePort, msg);
    } catch (err) {}

    let ctx = this;
    if (!this.found) {
      setTimeout(function () {
        ctx.send_try(magic, broadcastSocket, remotePort);
      }, 1000);
      //setTimeout(this.send_try(magic, broadcast_socket, remotePort), 1000);
    }
  }

  send_data(sender, port, msg) {
    NetworkInfo.getIPAddress().then((ipAddress) => {
      ipAddress = ipAddress.split('.');
      ipAddress[3] = 255;
      var broadcast_addr = ipAddress.join('.');
      var enc_msg = this.crypt(msg);
      sender.send(
        Buffer.from(enc_msg),
        0,
        msg.length,
        port,
        broadcast_addr,
        (err) => {
          if (err) {
          } else {
          }
        },
      );
    });
  }

  close = () => {
    if (this.broadcastSocket) {
      this.broadcastSocket.close();
      this.broadcastSocket = null;
    }
  };
}
