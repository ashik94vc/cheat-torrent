import dgram from 'dgram';
import {createConnectionRequest, sendMessageUDP, parseConnectionResponse, closeRetryLoop} from './utils';

export default class UDPPeers {

    static getPeers(url, callback) {
        const socket = dgram.createSocket('udp4');
        sendMessageUDP(socket,createConnectionRequest(),url);
        socket.on('message', response=>{
            socket.close();
            console.log(parseConnectionResponse(response));
            closeRetryLoop();
            callback(response);
        });
    }

}