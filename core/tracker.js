import net from 'net';
import dgram from 'dgram';
import {Buffer} from 'buffer';
import {parse} from 'url';
import crypto from 'crypto';
import bencode from 'bencode';
import axios from 'axios';
import udp from './udp/peers';

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
    const info_hash = crypto.createHash('sha1').update(bencode.encode(torrent.info)).digest('hex');
    axios.get(url.href, {
        params: {
            info_hash
        }
    }).then((response)=>{
       console.log(response);
        callback(response);
    });
}

export function getPeers(torrent, callback) {
    const rawURL = torrent.announce.toString('utf8');
    const url = parse(rawURL);
    console.log(url);
    if(url.protocol === 'udp:') {
        udp.getPeers(url,(response)=>{
            console.log("Response Received");
            console.log(response.toString('utf8'));
        })
    } else {
        getPeersTCP(torrent, url, ()=>{
            console.log("Response Received");
            console.log(response);
        });
    }
}