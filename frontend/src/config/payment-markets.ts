export type PaymentMarket = {
  code: string;
  country: string;
  city: string;
  currency: string;
  provider: string;
  qr: string[];
  wallets: string[];
  banks: string[];
};

export const PAYMENT_MARKETS: PaymentMarket[] = [
  { code: 'GB', country: 'United Kingdom', city: 'London', currency: 'GBP', provider: 'Stripe', qr: ['Pay by Bank QR'], wallets: ['Apple Pay', 'Google Pay'], banks: ['Barclays', 'HSBC', 'Lloyds'] },
  { code: 'DE', country: 'Germany', city: 'Berlin', currency: 'EUR', provider: 'Adyen', qr: ['giropay QR'], wallets: ['PayPal', 'Google Pay'], banks: ['Deutsche Bank', 'Commerzbank', 'N26'] },
  { code: 'PT', country: 'Portugal', city: 'Lisbon', currency: 'EUR', provider: 'Stripe', qr: ['Multibanco QR'], wallets: ['MB WAY', 'Apple Pay'], banks: ['Caixa Geral', 'Millennium BCP', 'Novo Banco'] },
  { code: 'BG', country: 'Bulgaria', city: 'Sofia', currency: 'BGN', provider: 'Adyen', qr: ['ePay QR'], wallets: ['Apple Pay', 'Google Pay'], banks: ['DSK Bank', 'UniCredit Bulbank', 'Fibank'] },
  { code: 'UA', country: 'Ukraine', city: 'Kyiv', currency: 'UAH', provider: 'LiqPay', qr: ['Privat24 QR'], wallets: ['monobank', 'Google Pay'], banks: ['PrivatBank', 'monobank', 'Oschadbank'] },
  { code: 'CN', country: 'China', city: 'Beijing / Shenzhen', currency: 'CNY', provider: 'Alipay / WeChat Pay', qr: ['Alipay QR', 'WeChat Pay QR'], wallets: ['Alipay', 'WeChat Pay'], banks: ['ICBC', 'China Construction Bank', 'Bank of China'] },
  { code: 'KR', country: 'South Korea', city: 'Seoul', currency: 'KRW', provider: 'Toss Payments', qr: ['Kakao Pay QR'], wallets: ['Kakao Pay', 'Naver Pay'], banks: ['KB Kookmin', 'Shinhan', 'Woori'] },
  { code: 'VN', country: 'Vietnam', city: 'Hanoi', currency: 'VND', provider: 'VNPay', qr: ['VNPay QR'], wallets: ['MoMo', 'ZaloPay'], banks: ['Vietcombank', 'Techcombank', 'BIDV'] },
  { code: 'PH', country: 'Philippines', city: 'Manila', currency: 'PHP', provider: 'Maya / GCash', qr: ['QR Ph'], wallets: ['Maya', 'GCash'], banks: ['BDO', 'BPI', 'UnionBank'] },
  { code: 'IN', country: 'India', city: 'Bangalore / Gurgaon', currency: 'INR', provider: 'Razorpay', qr: ['UPI QR'], wallets: ['Paytm', 'PhonePe'], banks: ['HDFC Bank', 'ICICI Bank', 'State Bank of India'] },
  { code: 'US', country: 'United States', city: 'San Francisco', currency: 'USD', provider: 'Stripe', qr: ['Pay by Bank QR'], wallets: ['Apple Pay', 'Google Pay'], banks: ['Chase', 'Bank of America', 'Wells Fargo'] },
  { code: 'EG', country: 'Egypt', city: 'Cairo', currency: 'EGP', provider: 'Fawry', qr: ['Fawry QR'], wallets: ['Vodafone Cash', 'Orange Money'], banks: ['CIB', 'National Bank of Egypt', 'Banque Misr'] },
  { code: 'SG', country: 'Singapore', city: 'Singapore', currency: 'SGD', provider: 'HitPay', qr: ['PayNow QR'], wallets: ['GrabPay', 'Apple Pay'], banks: ['DBS', 'OCBC', 'UOB'] },
];

export const getPaymentMarket = (code?: string) =>
  PAYMENT_MARKETS.find((market) => market.code === code) ?? PAYMENT_MARKETS.find((market) => market.code === 'PH')!;
