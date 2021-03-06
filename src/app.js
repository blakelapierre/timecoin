import { h, render } from 'preact-cycle';

const HASH_SLOTS = 5;
const BLOCK_TIME = 5;

const {
  INIT,

  START_MINING,
  STOP_MINING,

  BE_TIMEKEEPER,

  ADD_SIM_MINER,
  TOGGLE_MINER
} = {
  INIT (_, mutation) {
    _.inited = true;
    _.mutation = mutation;

    console.log('init');

    mutation(ADD_SIM_MINER)();

    crypto.subtle.generateKey({
      //name: 'HMAC',
      //hash: 'SHA-256'
      name: 'ECDSA',
      namedCurve: 'P-256'
    }, true, ['sign'])
      .then(key => {
        _.mutation(_ => {
          _.keys.push(key);

          console.log(_.keys);

          mutation(START_MINING)(_.keys[0]);
          mutation(BE_TIMEKEEPER)();

          return _;
        })();
        
      })
      .catch(error => console.log({error}));


    setInterval(() => mutation(_ => _)(), Math.PI / 6 * 1000);
    // animate();

    function animate () {
      mutation(_ => _)();
      requestAnimationFrame(animate);
    }

    return _;
  },

  START_MINING (_, key) {
    if (!_.mining) {
      _.mining = true;

      
    }

    return _;
  },

  STOP_MINING (_) {
    _.mining = false;

    cancelInterval(_.miningInterval);

    return _;
  },

  ADD_SIM_MINER (_) {
    crypto.subtle.generateKey({
      //name: 'HMAC',
      //hash: 'SHA-256'
      name: 'ECDSA',
      namedCurve: 'P-256'
    }, true, ['sign'])
      .then(key => {
        _.mutation(_ => {
          _.miners.push(newMiner(key));

          return _;
        })();
        
      })
      .catch(error => console.log({error}));
  },

  TOGGLE_MINER (_, miner) {
    if (miner.data.mining) miner.stop();
    else miner.start(_.chain, _.mutation);
  },

  BE_TIMEKEEPER (_) {
    const dt = _.chain.currentBlock.completionTime - new Date().getTime();
    
    _.chain.currentBlockTimeout = setTimeout(() => {
      console.log('block done');
      _.mutation(_ => {
        _.chain.blocks.push(_.chain.currentBlock);

        _.chain.currentBlock = newCurrentBlock(_.chain.currentBlock.number + 1);
        _.chain.nonce = 0;

        return _;
      })();

      _.mutation(BE_TIMEKEEPER)();
    }, dt);

    return _;
  }
};


const INIT_GUI = ({}, {inited, mutation}) => inited ? <GUI /> : mutation(INIT)(mutation);

const GUI = ({}, {peers, miners, chain}) => (
  <gui>
    <sim-objects>
      <Peers peers={peers} />
      <Miners miners={miners} />
    </sim-objects>
    <ChainExplorer chain={chain} />
  </gui>
);

const Peers = ({peers}) => (
  <peers>
    Peers
    {peers.map(p => <Peer peer={p} />)}
  </peers>
);

const Peer = ({peer}) => (
  <peer>
    <address>{peer.address}</address>
  </peer>
);

const Miners = ({miners}, {mutation}) => (
  <miners>
    Miners
    {miners.map(m => (
      <miner onClick={mutation(TOGGLE_MINER, m)}>{JSON.stringify(m.data.mining)}</miner>
    ))}
  </miners>
);

const ChainExplorer = ({chain}) => (
  <chain-explorer>
    <CurrentBlock block={chain.currentBlock} />
    <Blocks chain={chain} />
  </chain-explorer>
);

const CurrentBlock = ({block}, {}) => (
  <current-block>
    <div>Current Block</div>
    <block-number>Block #: {block.number}</block-number>
    <transactions>
      {block.transactions.map(t => (
        <transaction>{t.value} | {t.from} -> {t.to}</transaction>
      ))}
    </transactions>
    Best Hashes
    <best-hashes>
      {block.bestHashes.map(bh => (
        <block-hash title={bh.hash}>{makeShort(bh.hash)} {bh.nonce}</block-hash>
      ))}
    </best-hashes>
    <time-remaining>{formatMilliseconds(block.completionTime - new Date().getTime())} remaining</time-remaining>
  </current-block>
);

const Blocks = ({chain}) => (
  <blocks>
    {chain.blocks.map(b => (
      <block>{b.number}</block>
    ))}
  </blocks>
);

const test_data = {
  miners: [],
  peers: [
    {address: '123.82.75.23'},
    {address: '123.82.75.26'},
    {address: '123.82.75.27'},
    {address: '123.82.75.28'},
    {address: '123.82.75.29'}
  ],
  keys: [],
  chain: {
    currentBlock: {
      number: 0,
      completionTime: new Date().getTime() + 10 * 1000,
      transactions: [{
        from: 'alkf3f976asf3lhad76f',
        to:   'asdflkdjflh3hlkhf3fj',
        value: 1
      },{
        from: 'asdflkdjflh3hlkhf3fj',
        to:   'alkf3f976asf3lhad76f',
        value: 2
      },{
        from: 'alkf3f976asf3lhad76f',
        to:   'h3hlasdf9863lkjhsdlf',
        value: 1
      },{
        from: 'h3hlasdf9863lkjhsdlf',
        to:   'asdflkdjflh3hlkhf3fj',
        value: 1
      },{
        from: 'lskefjlk3flkhalfhah3',
        to:   'h3hlasdf9863lkjhsdlf',
        value: 1
      }],
      bestHashes: []
    },
    blocks: []
  }
};

render(
  INIT_GUI, test_data, document.body
);

function formatMilliseconds (ms) {
  const seconds = Math.floor(ms / 1000);

  return `${(ms / 1000).toFixed(3)} seconds`;
}

function makeShort (string) {
  if (string.length > 10)
    return `${string.substr(0, 5)}...${string.substr(string.length - 6, 5)}`;
  else return string;
}

function hashBlock ({number, transactions}, nonce, key) {
  const block = {number, transactions};

  return crypto
    .subtle
    .exportKey('raw', key.publicKey)
    .then(bufferToHexString)
    .then(pk =>
      crypto
        .subtle
        .sign({
          name: 'ECDSA', 
          hash: 'SHA-256'
        }, key.privateKey, new TextEncoder().encode(JSON.stringify({
          block, 
          nonce, 
          pk
        })))
        .then(bufferToHexString)
        .then(signature => {
          return crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({block, nonce, pk, signature})))
               .then(bufferToHexString)
               .then(hash => ({signature, hash, block, nonce, pk}));
        })
    );
}

function bufferToHexString (buffer) {
  return Array.from(new Uint8Array(buffer))
              .map(b => b.toString(16).padStart(2, '0')).join('');
}

function newCurrentBlock (blockNumber = 0) {
  return {
    number: blockNumber,
    completionTime: new Date().getTime() + 10 * 1000,
    transactions: [],
    bestHashes: []
  };
}

function newMiner (key) {
  const data = {
    mining: false,
    key
  };

  return {
    data,

    start (chain, mutation) {
      if (data.mining) return;

      data.mining = true;

      let nonce = 0;

      data.miningInterval = setInterval(() => {
        hashBlock(chain.currentBlock, nonce++, key)
          .then(({hash}) => {
            if (chain.currentBlock.bestHashes.length === 0 || hash < chain.currentBlock.bestHashes[0].hash) {
              let i = 1;
              for (i; i < chain.currentBlock.bestHashes.length; i++) {
                if (hash < chain.currentBlock.bestHashes[i].hash) continue;
                else break;
              }

              mutation(_ => {
                if (chain.currentBlock.bestHashes.length < HASH_SLOTS) {
                  chain.currentBlock.bestHashes.splice(i, 0, {hash, nonce});
                }
                else if (i > 0) {
                  chain.currentBlock.bestHashes.splice(i - 1, 1, {hash, nonce});
                }
                return _;
              })();
            }
          });
      }, 250);
    },

    stop() {
      data.mining = false;
      clearInterval(data.miningInterval);
    }
  };
}