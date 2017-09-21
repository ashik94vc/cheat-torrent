import crypto from 'crypto';
import {Buffer} from 'buffer';
import {PEER_SIGNATURE} from "../constants";

let timeout;
let peer_id = null;

export function genPeerID() {
    if(!peer_id) {
        peer_id = crypto.randomBytes(20);
        Buffer.from(PEER_SIGNATURE).copy(peer_id,0);
    }
}

export function createAnnounceRequest(connectionID, transactionID, action, info_hash, ) {
    // Build announce request according to BEP defined here http://www.bittorrent.org/beps/bep_0015.html
    let buf = Buffer.allocUnsafe(98);
    /*
            BEP ANNOUNCE REQUEST FORMAT
       Offset  Size    Name    Value
       0       64-bit integer  connection_id
       8       32-bit integer  action          1 // announce
       12      32-bit integer  transaction_id
       16      20-byte string  info_hash
       36      20-byte string  peer_id
       56      64-bit integer  downloaded
       64      64-bit integer  left
       72      64-bit integer  uploaded
       80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
       84      32-bit integer  IP address      0 // default
       88      32-bit integer  key
       92      32-bit integer  num_want        -1 // default
       96      16-bit integer  port
       98 */
    buf.copy(connectionID,0);
    buf.writeInt32BE(1,8);
    buf.writeInt32BE(transactionID,12)

}

export function createConnectionRequest() {
    // Build connection request according to BEP defined here http://www.bittorrent.org/beps/bep_0015.html
    let buf = Buffer.allocUnsafe(16);

    //Magic constant as defined in BEP
    buf.writeUInt32BE(0x417, 0);
    buf.writeUInt32BE(0x27101980, 4);

    //Action 0=connect. As defined in BEP
    buf.writeUInt32BE(0, 8);

    //transactionID random ID
    const transaction_id = crypto.randomBytes(4);
    transaction_id.copy(buf,12);
    return buf;
}

export function closeRetryLoop() {
    clearTimeout(timeout);
}

export function sendMessageUDP(socket, message, url, callback=(err)=>{err && console.error(err); console.log("Trying to send message")}) {
    socket.send(message, 0, message.length, url.port, url.hostname, callback);
    timeout = setTimeout(sendMessageUDP, 5000, socket, message, url, callback);
}

export function parseConnectionResponse(response) {
    if(response.length >= 16) {
        return {
            error: false,
            action: response.readUInt32BE(0),
            transaction_id: response.readUInt32BE(4),
            connection_id: response.slice(8)
        }
    }
    return {
        error: true,
        error_message: 'Incorrect Size'
    }
}
