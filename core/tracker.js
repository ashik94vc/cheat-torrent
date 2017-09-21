import net from 'net';
import dgram from 'dgram';
import {Buffer} from 'buffer';
import {parse} from 'url';
import crypto from 'crypto';
import bencode from 'bencode';

let timeout;
function createConnectionRequest() {
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
    console.log("Generated Transaction ID: " + transaction_id.toString('utf8'));
    console.log(buf);
    return buf;
}

function createConnectionSocket(message, rawURL, callback=(err)=>{console.log(err)}) {
    const url = parse(rawURL);
    console.log(url);
    let socket;
    if(url.protocol === 'udp:') {
        socket = dgram.createSocket('udp4');
        socket.send(message, 0, message.length, url.port, url.hostname, callback)
    }
    else {
        socket = new net.Socket();
        socket.connect(url.port, url.hostname, ()=>{
            socket.write(message);
        })
    }
    return socket;
}

function sendMessageUDP(socket, message, url, callback=(err)=>{err && console.error(err)}) {
    console.log("Attempting...");
    socket.send(message, 0, message.length, url.port, url.hostname, callback);
    timeout = setTimeout(sendMessageUDP, 3000, socket, message, rawURL, callback);
}

function getPeersUDP(url, callback) {
    const socket = dgram.createSocket('udp4');
    sendMessageUDP(socket,createConnectionRequest(),url);
    socket.on('message', response=>{
       console.log(response);
       clearTimeout(timeout);
       socket.close();
       callback(response);
    });
}

function getPeersTCP(torrent,url, callback) {
    const socket = new net.Socket();
    const info_hash = crypto.createHash('sha1').update(bencode.encode(torrent.info)).digest('hex');

    socket.connect(url.port, url.hostname, ()=>{
       socket.write()
    });
}

export function getPeers(torrent, callback) {
    const rawUrl = torrent.announce.toString('utf8');
    const url = parse(rawURL);

    const socket = dgram.createSocket('udp4');
    sendMessageUDP(socket, createConnectionRequest(), url, callback);
    // console.log(url);
    socket.on('message', response => {
        console.log('message received');
        clearTimeout(timeout);
        socket.close();
        console.log(response.readUInt32BE(0));
    });
    socket.on('error',error=>{
        console.log('Error');
        clearTimeout(timeout);
    });
    socket.on('data',data=>{
       console.log('Data Received');
        clearTimeout(timeout);
    })
}