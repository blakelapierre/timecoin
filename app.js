!function n(e,t,r){function u(o,c){if(!t[o]){if(!e[o]){var a="function"==typeof require&&require;if(!c&&a)return a(o,!0);if(i)return i(o,!0);var s=new Error("Cannot find module '"+o+"'");throw s.code="MODULE_NOT_FOUND",s}var l=t[o]={exports:{}};e[o][0].call(l.exports,function(n){var t=e[o][1][n];return u(t||n)},l,l.exports,n,e,t,r)}return t[o].exports}for(var i="function"==typeof require&&require,o=0;o<r.length;o++)u(r[o]);return u}({1:[function(n,e,t){"use strict";function r(n){if(null==n)throw new TypeError("Cannot destructure undefined")}function u(n){Math.floor(n/1e3);return(n/1e3).toFixed(3)+" seconds"}function i(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return n.length>10?n.substr(0,5)+"..."+n.substr(n.length-6,5):n}function o(n,e,t){var r={number:n.number,transactions:n.transactions};return crypto.subtle.exportKey("raw",t.publicKey).then(c).then(function(n){return crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},t.privateKey,(new TextEncoder).encode(JSON.stringify({block:r,nonce:e,publicKey:n}))).then(c).then(function(t){return crypto.subtle.digest("SHA-256",(new TextEncoder).encode(JSON.stringify({block:r,nonce:e,publicKey:n,signature:t}))).then(c).then(function(u){return{signature:t,hash:u,block:r,nonce:e,publicKey:n}})})})}function c(n){return Array.from(new Uint8Array(n)).map(function(n){return n.toString(16).padStart(2,"0")}).join("")}function a(){return{number:arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,completionTime:(new Date).getTime()+1e3*f,transactions:[],bestHashes:[]}}function s(n,e){var t={mining:!1,key:n,publicKey:e};return{data:t,start:function(e,r){if(!t.mining){t.mining=!0;var u=0;t.miningInterval=setInterval(function(){o(e.currentBlock,u++,n).then(function(n){var t=n.hash,i=n.signature,o=n.publicKey,c=0;for(c;c<e.currentBlock.bestHashes.length&&t<e.currentBlock.bestHashes[c].hash;c++);r(function(n){return e.currentBlock.bestHashes.length<h?e.currentBlock.bestHashes.splice(c,0,{hash:t,nonce:u,signature:i,publicKey:o}):c>0&&(e.currentBlock.bestHashes.splice(c,0,{hash:t,nonce:u,signature:i,publicKey:o}),e.currentBlock.bestHashes.shift()),n})()})},250)}},stop:function(){t.mining=!1,clearInterval(t.miningInterval)}}}var l=n("preact-cycle"),h=5,f=5,m={INIT:function(n,e){return n.inited=!0,n.mutation=e,console.log("init"),e(y)(),crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},!0,["sign"]).then(function(t){n.mutation(function(n){return n.keys.push(t),console.log(n.keys),e(p)(n.keys[0]),e(g)(),n})()}).catch(function(n){return console.log({error:n})}),setInterval(function(){return e(function(n){return n})()},Math.PI/6*1e3),n},START_MINING:function(n,e){return n.mining||(n.mining=!0),n},STOP_MINING:function(n){return n.mining=!1,cancelInterval(n.miningInterval),n},ADD_SIM_MINER:function(n){crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},!0,["sign"]).then(function(e){return crypto.subtle.exportKey("raw",e.publicKey).then(c).then(function(t){n.mutation(function(n){var r=s(e,t);return n.miners.push(r),n.mutation(v)(r),n})()})}).catch(function(n){return console.log({error:n})})},TOGGLE_MINER:function(n,e){e.data.mining?e.stop():e.start(n.chain,n.mutation)},BE_TIMEKEEPER:function(n){var e=n.chain,t=e.currentBlock.completionTime-(new Date).getTime();return e.currentBlockTimeout=setTimeout(function(){console.log("block done"),n.mutation(function(n){var t=e.blocks,r=e.currentBlock,u=r.bestHashes,i=r.transactions,o=u.reduce(function(n,e,t){return n[e.publicKey]=(n[e.publicKey]||0)+Math.pow(2,t),n},{});return console.log({rewards:o}),Object.keys(o).forEach(function(n){i.push({to:n,value:o[n]})}),i.forEach(function(n){e.balances[n.to]=(e.balances[n.to]||0)+n.value,e.balances[n.from]=(e.balances[n.from]||0)-n.value}),t.unshift(r),e.currentBlock=a(r.number+1),e.nonce=0,n})(),n.mutation(g)()},t),n}},b=m.INIT,p=m.START_MINING,g=m.BE_TIMEKEEPER,y=m.ADD_SIM_MINER,v=m.TOGGLE_MINER,d=function(n,e){var t=e.peers,u=e.miners,i=e.chain;return r(n),(0,l.h)("gui",null,(0,l.h)("sim-objects",null,(0,l.h)(k,{peers:t}),(0,l.h)(I,{miners:u})),(0,l.h)(T,{chain:i}))},k=function(n){var e=n.peers;return(0,l.h)("peers",null,"Peers",e.map(function(n){return(0,l.h)(E,{peer:n})}))},E=function(n){var e=n.peer;return(0,l.h)("peer",null,(0,l.h)("address",null,e.address))},I=function(n,e){var t=n.miners,r=e.chain,u=e.mutation;return(0,l.h)("miners",null,"Miners",t.map(function(n){return(0,l.h)("miner",{onClick:u(v,n)},i(n.data.publicKey)," | ",n.data.mining?"mining":"not mining"," | ",r.balances[n.data.publicKey]||0)}),(0,l.h)("button",{onClick:u(y)},"Add Miner"))},T=function(n){var e=n.chain;return(0,l.h)("chain-explorer",null,(0,l.h)(K,{block:e.currentBlock}),(0,l.h)(B,{chain:e}))},K=function(n,e){var t=n.block;return r(e),(0,l.h)("current-block",null,(0,l.h)("div",null,"Current Block"),(0,l.h)("block-number",null,"Block #: ",t.number),(0,l.h)("transactions",null,t.transactions.map(function(n){return(0,l.h)("transaction",null,n.value," | ",i(n.from)," -> ",i(n.to))})),"Best Hashes",(0,l.h)("best-hashes",null,t.bestHashes.map(function(n){return(0,l.h)("block-hash",{title:n.hash},i(n.hash)," ",n.nonce," ",i(n.publicKey))})),(0,l.h)("time-remaining",null,u(t.completionTime-(new Date).getTime())," remaining"))},B=function(n){var e=n.chain;return(0,l.h)("blocks",null,e.blocks.map(function(n){return(0,l.h)("block",null,n.number,(0,l.h)("transactions",null,n.transactions.map(function(n){return(0,l.h)("transaction",null,n.value," | ",i(n.from)," -> ",i(n.to))})))}))},M={miners:[],peers:[],keys:[],chain:{currentBlock:a(),blocks:[],balances:{}}};(0,l.render)(function(n,e){var t=e.inited,u=e.mutation;return r(n),t?(0,l.h)(d,null):u(b)(u)},M,document.body)},{"preact-cycle":"preact-cycle"}]},{},[1]);