import fs from 'fs';
import bencode from 'bencode';
import {getPeers} from "./core/tracker";

const torrent = bencode.decode(fs.readFileSync('/Users/ashikvetrivelu/Downloads/baasha.torrent'));

getPeers(torrent);