const express = require('express');
const axios = require(‘axios’);
const cors = require(‘cors’);
const OTPAuth = require(‘otpauth’);

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY     = process.env.API_KEY;
const CLIENT_ID   = process.env.CLIENT_ID;
const CLIENT_PIN  = process.env.CLIENT_PIN;
const TOTP_SECRET = process.env.TOTP_SECRET;

const BASE = process.env.ANGEL_BASE;

let session = { token: null, expiry: 0 };

function generateTOTP() {
const totp = new OTPAuth.TOTP({
secret: OTPAuth.Secret.fromBase32(TOTP_SECRET),
digits: 6,
period: 30,
algorithm: ‘SHA1’
});
return totp.generate();
}

async function login() {
try {
const otpCode = generateTOTP();
const res = await axios.post(
BASE + ‘/rest/auth/angelbroking/user/v1/loginByPassword’,
{
clientcode: CLIENT_ID,
password: CLIENT_PIN,
totp: otpCode
},
{
headers: {
‘Content-Type’: ‘application/json’,
‘Accept’: ‘application/json’,
‘X-UserType’: ‘USER’,
‘X-SourceID’: ‘WEB’,
‘X-ClientLocalIP’: ‘127.0.0.1’,
‘X-ClientPublicIP’: ‘127.0.0.1’,
‘X-MACAddress’: ‘00:00:00:00:00:00’,
‘X-PrivateKey’: API_KEY
}
}
);
if (res.data.status && res.data.data) {
session.token  = res.data.data.jwtToken;
session.expiry = Date.now() + 55 * 60 * 1000;
console.log(‘Login success’);
return true;
}
console.error(‘Login failed:’, JSON.stringify(res.data));
return false;
} catch (e) {
console.error(‘Login error:’, e.message);
return false;
}
}

async function ensureSession() {
if (!session.token || Date.now() > session.expiry) {
return await login();
}
return true;
}

function getHeaders() {
return {
‘Authorization’: ’Bearer ’ + session.token,
‘Content-Type’: ‘application/json’,
‘Accept’: ‘application/json’,
‘X-UserType’: ‘USER’,
‘X-SourceID’: ‘WEB’,
‘X-ClientLocalIP’: ‘127.0.0.1’,
‘X-ClientPublicIP’: ‘127.0.0.1’,
‘X-MACAddress’: ‘00:00:00:00:00:00’,
‘X-PrivateKey’: API_KEY
};
}

var STOCKS = [
{ symbol: ‘HDFCBANK’,   token: ‘1333’,  name: ‘HDFC Bank’      },
{ symbol: ‘ICICIBANK’,  token: ‘4963’,  name: ‘ICICI Bank’     },
{ symbol: ‘KOTAKBANK’,  token: ‘1922’,  name: ‘Kotak Bank’     },
{ symbol: ‘AXISBANK’,   token: ‘5900’,  name: ‘Axis Bank’      },
{ symbol: ‘SBIN’,       token: ‘3045’,  name: ‘SBI’            },
{ symbol: ‘BANKBARODA’, token: ‘4668’,  name: ‘Bank of Baroda’ },
{ symbol: ‘FEDERALBNK’, token: ‘1023’,  name: ‘Federal Bank’   },
{ symbol: ‘INDUSINDBK’, token: ‘5258’,  name: ‘IndusInd Bank’  },
{ symbol: ‘IDFCFIRSTB’, token: ‘11195’, name: ‘IDFC First’     },
{ symbol: ‘AUBANK’,     token: ‘10840’, name: ‘AU Bank’        },
{ symbol: ‘PNB’,        token: ‘2730’,  name: ‘PNB’            },
{ symbol: ‘CANBK’,      token: ‘10794’, name: ‘Canara Bank’    },
{ symbol: ‘RELIANCE’,   token: ‘2885’,  name: ‘Reliance’       },
{ symbol: ‘TCS’,        token: ‘11536’, name: ‘TCS’            },
{ symbol: ‘INFY’,       token: ‘1594’,  name: ‘Infosys’        },
{ symbol: ‘HINDUNILVR’, token: ‘1394’,  name: ‘HUL’            },
{ symbol: ‘ITC’,        token: ‘1660’,  name: ‘ITC’            },
{ symbol: ‘LT’,         token: ‘11483’, name: ‘L and T’        },
{ symbol: ‘BAJFINANCE’, token: ‘317’,   name: ‘Bajaj Finance’  },
{ symbol: ‘BAJAJFINSV’, token: ‘16675’, name: ‘Bajaj Finserv’  },
{ symbol: ‘MARUTI’,     token: ‘10999’, name: ‘Maruti’         },
{ symbol: ‘ASIANPAINT’, token: ‘236’,   name: ‘Asian Paints’   },
{ symbol: ‘TITAN’,      token: ‘3506’,  name: ‘Titan’          },
{ symbol: ‘WIPRO’,      token: ‘3787’,  name: ‘Wipro’          },
{ symbol: ‘HCLTECH’,    token: ‘1363’,  name: ‘HCL Tech’       },
{ symbol: ‘SUNPHARMA’,  token: ‘3351’,  name: ‘Sun Pharma’     },
{ symbol: ‘DRREDDY’,    token: ‘881’,   name: ‘Dr Reddys’      },
{ symbol: ‘CIPLA’,      token: ‘694’,   name: ‘Cipla’          },
{ symbol: ‘ONGC’,       token: ‘2475’,  name: ‘ONGC’           },
{ symbol: ‘POWERGRID’,  token: ‘14977’, name: ‘Power Grid’     },
{ symbol: ‘NTPC’,       token: ‘11630’, name: ‘NTPC’           },
{ symbol: ‘COALINDIA’,  token: ‘20374’, name: ‘Coal India’     },
{ symbol: ‘TATASTEEL’,  token: ‘3499’,  name: ‘Tata Steel’     },
{ symbol: ‘JSWSTEEL’,   token: ‘11723’, name: ‘JSW Steel’      },
{ symbol: ‘ADANIENT’,   token: ‘25’,    name: ‘Adani Ent’      },
{ symbol: ‘ADANIPORTS’, token: ‘15083’, name: ‘Adani Ports’    },
{ symbol: ‘ULTRACEMCO’, token: ‘11532’, name: ‘UltraTech’      },
{ symbol: ‘GRASIM’,     token: ‘1232’,  name: ‘Grasim’         },
{ symbol: ‘NESTLEIND’,  token: ‘17963’, name: ‘Nestle’         },
{ symbol: ‘BRITANNIA’,  token: ‘547’,   name: ‘Britannia’      },
{ symbol: ‘TATAMOTORS’, token: ‘3456’,  name: ‘Tata Motors’    },
{ symbol: ‘M&M’,        token: ‘2031’,  name: ‘Mahindra’       },
{ symbol: ‘EICHERMOT’,  token: ‘910’,   name: ‘Eicher Motors’  },
{ symbol: ‘HEROMOTOCO’, token: ‘1348’,  name: ‘Hero MotoCorp’  },
{ symbol: ‘TATACONSUM’, token: ‘3720’,  name: ‘Tata Consumer’  },
{ symbol: ‘APOLLOHOSP’, token: ‘157’,   name: ‘Apollo Hosp’    },
{ symbol: ‘DIVISLAB’,   token: ‘10940’, name: ‘Divis Lab’      },
{ symbol: ‘TECHM’,      token: ‘13538’, name: ‘Tech M’         },
{ symbol: ‘BPCL’,       token: ‘526’,   name: ‘BPCL’           }
];

async function getOptionChain(symbol, expiry) {
try {
const res = await axios.post(
BASE + ‘/rest/secure/angelbroking/market/v1/optionChain’,
{ name: symbol, expirydate: expiry },
{ headers: getHeaders() }
);
if (res.data.status && res.data.data) return res.data.data;
return null;
} catch (e) {
return null;
}
}

async function getLTP(token) {
try {
const res = await axios.post(
BASE + ‘/rest/secure/angelbroking/market/v1/quote/’,
{ mode: ‘FULL’, exchangeTokens: { NSE: [token] } },
{ headers: getHeaders() }
);
if (res.data.status && res.data.data && res.data.data.fetched && res.data.data.fetched[0]) {
var d = res.data.data.fetched[0];
return { ltp: d.ltp, high: d.high, low: d.low };
}
return null;
} catch (e) {
return null;
}
}

function scoreStock(ce, pe) {
if (!ce || !ce.length || !pe || !pe.length) return 0;
var top = ce.slice(0, 5).concat(pe.slice(0, 5));
var oi    = top.reduce(function(a, s) { return a + (s.openInterest || 0); }, 0);
var oichg = top.reduce(function(a, s) { return a + Math.abs(s.changeinOpenInterest || 0); }, 0);
var vol   = top.reduce(function(a, s) { return a + (s.totalTradedVolume || 0); }, 0);
return Math.round(
Math.min(oi / 1000000, 40) +
Math.min(oichg / 100000, 30) +
Math.min(vol / 500000, 30)
);
}

function getSignal(ce, pe) {
if (!ce || !ce.length || !pe || !pe.length) return ‘WATCH’;
var ceOI  = ce.reduce(function(a, s) { return a + (s.openInterest || 0); }, 0);
var peOI  = pe.reduce(function(a, s) { return a + (s.openInterest || 0); }, 0);
var ceChg = ce.reduce(function(a, s) { return a + (s.changeinOpenInterest || 0); }, 0);
var peChg = pe.reduce(function(a, s) { return a + (s.changeinOpenInterest || 0); }, 0);
var pcr = peOI / (ceOI || 1);
if (Math.abs(pcr - 1) < 0.15 && ceChg > 0 && peChg > 0) return ‘BOTH ACTIVE’;
if (ceChg > peChg * 1.5 && pcr < 0.8) return ‘CE SELL’;
if (peChg > ceChg * 1.5 && pcr > 1.2) return ‘PE SELL’;
if (pcr < 0.8) return ‘CE SELL’;
if (pcr > 1.2) return ‘PE SELL’;
return ‘WATCH’;
}

function pickTop3(strikes, ltp) {
if (!strikes || !strikes.length) return [];
var scored = strikes.map(function(s) {
return {
strike:  s.strikePrice,
premium: s.lastPrice || 0,
oi:      s.openInterest || 0,
score:   Math.max(0, 500 - Math.abs(s.strikePrice - ltp)) +
(s.openInterest || 0) / 10000 +
Math.abs(s.changeinOpenInterest || 0) / 1000 +
(s.totalTradedVolume || 0) / 10000
};
});
scored.sort(function(a, b) { return b.score - a.score; });
return scored.slice(0, 3);
}

function getNearestExpiry() {
var now = new Date();
var daysToThursday = (4 - now.getDay() + 7) % 7 || 7;
var expiry = new Date(now);
expiry.setDate(now.getDate() + daysToThursday);
var dd = String(expiry.getDate()).padStart(2, ‘0’);
var mm = expiry.toLocaleString(‘en-US’, { month: ‘short’ }).toUpperCase();
var yy = String(expiry.getFullYear()).slice(2);
return dd + mm + yy;
}

app.get(’/api/scan’, async function(req, res) {
var ok = await ensureSession();
if (!ok) return res.status(401).json({ error: ‘Login failed. Check credentials.’ });

var expiry = getNearestExpiry();
var results = [];

for (var i = 0; i < STOCKS.length; i += 5) {
var batch = STOCKS.slice(i, i + 5);
var batchResults = await Promise.all(batch.map(async function(stock) {
try {
var quote = await getLTP(stock.token);
var chain = await getOptionChain(stock.symbol, expiry);
if (!quote || !chain) return null;
var ltp = quote.ltp;
var all = Array.isArray(chain) ? chain : [];
var ce = all.filter(function(s) { return s.optionType === ‘CE’; });
var pe = all.filter(function(s) { return s.optionType === ‘PE’; });
if (!ce.length) ce = all.filter(function(s) { return s.strikePrice >= ltp; });
if (!pe.length) pe = all.filter(function(s) { return s.strikePrice <= ltp; });
return {
symbol: stock.symbol,
name:   stock.name,
ltp:    ltp,
high:   quote.high,
low:    quote.low,
score:  scoreStock(ce, pe),
signal: getSignal(ce, pe),
ce:     pickTop3(ce, ltp),
pe:     pickTop3(pe, ltp),
expiry: expiry
};
} catch (e) {
return null;
}
}));
batchResults.forEach(function(r) { if (r) results.push(r); });
if (i + 5 < STOCKS.length) {
await new Promise(function(r) { setTimeout(r, 300); });
}
}

results.sort(function(a, b) { return b.score - a.score; });
var interesting = results.filter(function(s) { return s.score > 10; });

res.json({
stocks:    interesting.length ? interesting : results.slice(0, 10),
expiry:    expiry,
timestamp: Date.now(),
total:     results.length
});
});

app.get(’/health’, function(req, res) {
res.json({ status: ‘ok’, session: !!session.token });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
console.log(’Server running on port ’ + PORT);
});
