# bot_i18n.py
resources = {
    "en": {
        "welcome": "Welcome to HAYQ Bot",
        "walletConnect": "Connect Wallet",
        "balance": "Balance",
        "transfer": "Transfer HAYQ",
        "stake": "Stake HAYQ",
        "unstake": "Unstake HAYQ",
        "buyback": "Buyback",
        "voting": "Voting / Snapshot",
        "liveChart": "Live Chart",
        "dividend": "Claim Dividend",
        "growth": "Economic Growth"
    },
    "hy": {
        "welcome": "Բարի գալուստ HAYQ Բոտ",
        "walletConnect": "Միացնել դրամապանակը",
        "balance": "Մնացորդ",
        "transfer": "Փոխանցել HAYQ",
        "stake": "Ստեյք HAYQ",
        "unstake": "Ապաստեյք HAYQ",
        "buyback": "Վերագնում",
        "voting": "Քվեարկություն / Սնափշոթ",
        "liveChart": "Կենդանի գրաֆիկ",
        "dividend": "Պահանջել դիվիդենտ",
        "growth": "Տնտեսական աճ"
    },
    "ru": {
        "welcome": "Добро пожаловать на HAYQ Бот",
        "walletConnect": "Подключить кошелек",
        "balance": "Баланс",
        "transfer": "Перевести HAYQ",
        "stake": "Стейк HAYQ",
        "unstake": "Анстейк HAYQ",
        "buyback": "Выкуп",
        "voting": "Голосование / Снэпшот",
        "liveChart": "Живой график",
        "dividend": "Забрать дивиденды",
        "growth": "Экономический рост"
    },
    "fr": {
        "welcome": "Bienvenue sur le HAYQ Bot",
        "walletConnect": "Connecter le portefeuille",
        "balance": "Solde",
        "transfer": "Transférer HAYQ",
        "stake": "Staker HAYQ",
        "unstake": "Unstaker HAYQ",
        "buyback": "Rachat",
        "voting": "Vote / Snapshot",
        "liveChart": "Graphique en direct",
        "dividend": "Réclamer le dividende",
        "growth": "Croissance économique"
    },
    "es": {
        "welcome": "Bienvenido al HAYQ Bot",
        "walletConnect": "Conectar billetera",
        "balance": "Saldo",
        "transfer": "Transferir HAYQ",
        "stake": "Stakear HAYQ",
        "unstake": "Unstakear HAYQ",
        "buyback": "Recompra",
        "voting": "Votación / Snapshot",
        "liveChart": "Gráfico en vivo",
        "dividend": "Reclamar dividendo",
        "growth": "Crecimiento económico"
    },
    "de": {
        "welcome": "Willkommen im HAYQ Bot",
        "walletConnect": "Wallet verbinden",
        "balance": "Kontostand",
        "transfer": "HAYQ übertragen",
        "stake": "HAYQ staken",
        "unstake": "HAYQ unstaken",
        "buyback": "Rückkauf",
        "voting": "Abstimmung / Snapshot",
        "liveChart": "Live-Diagramm",
        "dividend": "Dividende beanspruchen",
        "growth": "Wirtschaftswachstum"
    },
    "zh": {
        "welcome": "欢迎来到 HAYQ Bot",
        "walletConnect": "连接钱包",
        "balance": "余额",
        "transfer": "转账 HAYQ",
        "stake": "质押 HAYQ",
        "unstake": "解除质押 HAYQ",
        "buyback": "回购",
        "voting": "投票 / 快照",
        "liveChart": "实时图表",
        "dividend": "领取分红",
        "growth": "经济增长"
    },
    "ja": {
        "welcome": "HAYQ ボットへようこそ",
        "walletConnect": "ウォレット接続",
        "balance": "残高",
        "transfer": "HAYQ を送金",
        "stake": "HAYQ ステーキング",
        "unstake": "HAYQ アンステーキング",
        "buyback": "買い戻し",
        "voting": "投票 / スナップショット",
        "liveChart": "ライブチャート",
        "dividend": "配当を請求",
        "growth": "経済成長"
    },
    "ar": {
        "welcome": "مرحبًا بك في HAYQ Bot",
        "walletConnect": "ربط المحفظة",
        "balance": "الرصيد",
        "transfer": "تحويل HAYQ",
        "stake": "تخزين HAYQ",
        "unstake": "إلغاء التخزين HAYQ",
        "buyback": "إعادة شراء",
        "voting": "التصويت / اللقطة",
        "liveChart": "المخطط المباشر",
        "dividend": "المطالبة بالأرباح",
        "growth": "النمو الاقتصادي"
    }
}

def t(key, lang="en"):
    """Վերադարձնում է թարգմանությունը՝ ըստ լեզվի"""
    return resources.get(lang, resources["en"]).get(key, key)
