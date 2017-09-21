import fs from 'fs';
import bencode from 'bencode';
import crypto from 'crypto';
import {getPeers} from "./core/tracker";

const torrent = bencode.decode(fs.readFileSync('/Users/ashikvetrivelu/Downloads/baasha.torrent'));

// console.log(crypto.createHash('sha1').update(bencode.encode(torrent.info)).digest('hex'));

getPeers(torrent);