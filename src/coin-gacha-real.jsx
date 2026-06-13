import { useMemo, useState, useRef, useEffect } from "react";

/**
 * 古銭ガチャ — 鑑定ショー版（ブース / 1回の鑑定ドラマが主役・実データ）
 * 景品: 古銭買取専門店アンティーリンク（antylink.jp/buyinglist）の硬貨・紙幣＋大判（特級）
 * レア度 = 本日の買取価格（高いほど高レア＝低確率）/ スナップショット: 2026-06-07
 * 体験の核 = 「いくらの価値が出るか」を鑑定書の査定額カウントアップで魅せる。
 * ローカル検証用のUI演出です（実通貨・課金なし）。画像はantylink参照、失敗時はSVG代替。
 */

const ITEMS = [{"id": "m161", "name": "万延大判金", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/manen-oban-omote-160x261.webp", "rarity": "MASTER"}, {"id": "m162", "name": "天正大判金", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/tensho-oban-omote-160x250.webp", "rarity": "MASTER"}, {"id": "m163", "name": "天保大判金", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/trnpo-0ban-omote-160x248.webp", "rarity": "MASTER"}, {"id": "m164", "name": "享保大判金", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/kyoho-oban-omote-160x254.webp", "rarity": "MASTER"}, {"id": "m177", "name": "元禄大判金", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2025/07/genroku-oban-omote-160x213.webp", "rarity": "MASTER"}, {"id": "m178", "name": "無名大判金（蛭藻金）", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2025/07/mumei-oban-omote-160x213.jpg", "rarity": "MASTER"}, {"id": "m179", "name": "慶長大判金", "price": null, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2025/07/keicho-oban-omote-160x213.webp", "rarity": "MASTER"}, {"id": "i000", "name": "100円銀貨", "price": 638, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2025/01/100ginka3-omote-160x441.webp", "rarity": "N"}, {"id": "i001", "name": "東京オリンピック記念1000円硬貨（1964年）", "price": 5181, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/07/1000en-ginka-omote-160x160.webp", "rarity": "R"}, {"id": "i002", "name": "天皇陛下御在位60年記念10万円金貨", "price": 465200, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/2179-160x160.jpg", "rarity": "LEGEND"}, {"id": "i003", "name": "天皇陛下御即位記念10万円金貨", "price": 712800, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/2177-160x237.jpg", "rarity": "LEGEND"}, {"id": "i004", "name": "皇太子殿下御成婚記念5万円金貨", "price": 414200, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/2178-160x226.jpg", "rarity": "LEGEND"}, {"id": "i005", "name": "沖縄復帰50周年記念1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2022/11/okinawa50-1mankinka-omote-160x160.webp", "rarity": "SSR"}, {"id": "i006", "name": "郵便制度150周年記念1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/11/batch_3701-160x150.jpg", "rarity": "SSR"}, {"id": "i007", "name": "近代通貨制度150周年記念1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/11/batch_4532-160x160.jpg", "rarity": "SSR"}, {"id": "i008", "name": "近代通貨制度150周年記念5000円金貨", "price": 183400, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/11/kindai150-5000en-1-160x160.webp", "rarity": "SSR"}, {"id": "i009", "name": "天皇陛下御在位10年記念1万円金貨プルーフ貨幣セット", "price": 465200, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/IMG_0030-1-160x160.jpg", "rarity": "LEGEND"}, {"id": "i010", "name": "天皇陛下御在位20年記念1万円金貨プルーフ貨幣セット", "price": 465200, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/IMG_5142-1-160x160.jpg", "rarity": "LEGEND"}, {"id": "i011", "name": "天皇陛下御在位30年記念1万円金貨プルーフ貨幣セット", "price": 465200, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_5151-1-160x160.jpg", "rarity": "LEGEND"}, {"id": "i012", "name": "天皇陛下御即位記念1万円金貨（令和元年）", "price": 465200, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0531-1-160x160.jpg", "rarity": "LEGEND"}, {"id": "i013", "name": "長野オリンピック1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/IMG_5275-1-160x160.jpg", "rarity": "SSR"}, {"id": "i014", "name": "2025年日本国際博覧会記念1万円金貨幣（ミャクミャク金貨）", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2025/09/10000yen-kinka-omote-160x160.jpg", "rarity": "SSR"}, {"id": "i015", "name": "東京2020オリンピック競技大会記念1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/2020olympic-1mankinka-1-160x158.webp", "rarity": "SSR"}, {"id": "i016", "name": "東京2020パラリンピック1万円金貨 4次「聖火ランナー」と「国立競技場」と「心技体」", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/2020para4-1mankinka-omote-160x157.webp", "rarity": "SSR"}, {"id": "i017", "name": "2005年日本国際博覧会1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/2005banpaku-1mankinka-omote-160x160.webp", "rarity": "SSR"}, {"id": "i018", "name": "ラグビーワールドカップ1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/rugbywc1-160x160.webp", "rarity": "SSR"}, {"id": "i019", "name": "東日本大震災復興事業記念1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_1449-1-160x160.jpg", "rarity": "SSR"}, {"id": "i020", "name": "日韓ワールドカップ記念1万円金貨", "price": 359000, "type": "coin", "category": "日本の記念金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/nikkanwc-1mankinka-omote-160x160.webp", "rarity": "SSR"}, {"id": "i021", "name": "100円銀貨", "price": 638, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/01/100ginka3-omote-160x441.webp", "rarity": "N"}, {"id": "i022", "name": "東京オリンピック記念1000円硬貨（1964年）", "price": 5181, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/07/1000en-ginka-omote-160x160.webp", "rarity": "R"}, {"id": "i023", "name": "地方自治法施行60周年 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/tihouziti1_compressed-160x234.webp", "rarity": "R"}, {"id": "i024", "name": "地方自治法施行60周年 500円プルーフ", "price": 23500, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_3860-160x160.jpg", "rarity": "SR"}, {"id": "i025", "name": "地方自治法施行60周年 500円（カードケース入り）", "price": 23500, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/tihouziti-500yenkouka-omote-160x102.webp", "rarity": "SR"}, {"id": "i026", "name": "中部国際空港開港 記念500円銀貨", "price": 3000, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/batch_IMG_5362-160x163.png", "rarity": "R"}, {"id": "i027", "name": "東日本大震災復興事業記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_0529-160x160.jpg", "rarity": "R"}, {"id": "i028", "name": "小笠原諸島復帰50周年 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_0564-160x160.jpg", "rarity": "R"}, {"id": "i029", "name": "明治150年記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_0570-160x160.jpg", "rarity": "R"}, {"id": "i030", "name": "奄美群島復帰50周年 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/amami50-1000enginka-omote-160x163.webp", "rarity": "R"}, {"id": "i031", "name": "国際連合加盟50周年 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/kokuren50-1000enginka-1-160x161.webp", "rarity": "R"}, {"id": "i032", "name": "2019年ラグビーW杯 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_9930-1-160x157.png", "rarity": "R"}, {"id": "i033", "name": "郵便制度150周年記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/11/4726-160x160.jpg", "rarity": "R"}, {"id": "i034", "name": "国立公園制度100周年記念1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/10/national_park0-e1729573582483-160x133.png", "rarity": "R"}, {"id": "i035", "name": "2025年日本国際博覧会記念1000円銀貨幣（第三次発行）", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/09/1000yen-ginaka-omote-160x160.jpg", "rarity": "R"}, {"id": "i036", "name": "2025年日本国際博覧会記念1000円銀貨幣（第二次発行）", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/09/expo2025-1000en2nd-omote-160x157.webp", "rarity": "R"}, {"id": "i037", "name": "2025年日本国際博覧会記念1000円銀貨幣（第一次発行）", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/01/expo2025-1000en-1-160x160.webp", "rarity": "R"}, {"id": "i038", "name": "沖縄復帰50周年記念1000円銀貨幣", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2022/09/okinawa50-1000en-omote-160x160.webp", "rarity": "R"}, {"id": "i039", "name": "鉄道開業150周年記念1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2023/03/testudou-1-160x158.webp", "rarity": "R"}, {"id": "i040", "name": "近代通貨制度150周年記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/11/sizedown1064-160x160.jpg", "rarity": "R"}, {"id": "i041", "name": "2005年 日本国際博覧会1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_5309-1-160x158.png", "rarity": "R"}, {"id": "i042", "name": "天皇陛下御在位60年記念1万円銀貨", "price": 9500, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/zaii60nen1manginka_omote-160x160.webp", "rarity": "R"}, {"id": "i043", "name": "皇太子殿下御成婚記念5000円銀貨幣", "price": 5000, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/goseikon-5000yen-omote-160x161.webp", "rarity": "R"}, {"id": "i044", "name": "2020年東京オリンピック1000円銀貨 リオ2016-東京2020 開催引継記念", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/1659__1-150x150-1.png", "rarity": "R"}, {"id": "i045", "name": "2020年東京パラリンピック1000円銀貨 リオ2016-東京2020 開催引継記念", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/1661__1-300x300-1-160x160.png", "rarity": "R"}, {"id": "i046", "name": "東京2020オリンピック競技大会記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0505-1-160x160.jpg", "rarity": "R"}, {"id": "i047", "name": "東京2020パラリンピック競技大会記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0037-2-160x160.jpg", "rarity": "R"}, {"id": "i048", "name": "2007年ユニバーサル技能五輪国際大会 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0582-1-160x161.png", "rarity": "R"}, {"id": "i049", "name": "国際通貨基金年次総会記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0548-1-160x159.png", "rarity": "R"}, {"id": "i050", "name": "新幹線鉄道開業50周年記念 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/1660-300x300-1-1-160x159.png", "rarity": "R"}, {"id": "i051", "name": "第8回アジア冬季競技大会 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_0557-160x160.jpg", "rarity": "R"}, {"id": "i052", "name": "2002年 サッカーワールドカップ記念1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2022/05/2020wc-1000enginka-box-160x160.webp", "rarity": "R"}, {"id": "i053", "name": "2003年 アジア競技大会 1000円銀貨", "price": 6800, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/10/asia1000yen-omote-160x160.webp", "rarity": "R"}, {"id": "i055", "name": "500円記念硬貨各種", "price": 500, "type": "coin", "category": "日本の記念硬貨・銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/500yen_kinen-omote-160x440.webp", "rarity": "N"}, {"id": "i057", "name": "ミントセット", "price": 600, "type": "coin", "category": "貨幣セット", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_0591-160x100.png", "rarity": "N"}, {"id": "i058", "name": "黒プルーフ貨幣セット", "price": 1800, "type": "coin", "category": "貨幣セット", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0001-160x160.jpg", "rarity": "N"}, {"id": "i059", "name": "プルーフ貨幣セット（銀メダル入）", "price": 7787, "type": "coin", "category": "貨幣セット", "img": "https://antylink.jp/wp-content/uploads/2021/09/Dragon-Ball-silvercoin-160x218.jpg", "rarity": "R"}, {"id": "i060", "name": "メダル入りプルーフ貨幣セット", "price": 666, "type": "coin", "category": "貨幣セット", "img": "https://antylink.jp/wp-content/uploads/2021/08/after_00003030-160x160.png", "rarity": "N"}, {"id": "i061", "name": "貨幣セット（額面666円）", "price": 1500, "type": "coin", "category": "貨幣セット", "img": "https://antylink.jp/wp-content/uploads/2021/10/IMG_8920-160x91.png", "rarity": "N"}, {"id": "i062", "name": "貨幣セット（額面666円以外）", "price": 1166, "type": "coin", "category": "貨幣セット", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0622-1-160x104.png", "rarity": "N"}, {"id": "i064", "name": "旧10円金貨", "price": 800000, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_29-1-160x159.png", "rarity": "LEGEND"}, {"id": "i065", "name": "旧5円金貨", "price": 260000, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1550-1-160x164.png", "rarity": "SSR"}, {"id": "i066", "name": "旧5円金貨（縮小）", "price": 240000, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1550-1-160x164.png", "rarity": "SSR"}, {"id": "i067", "name": "旧2円金貨", "price": 140000, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1551_1-1-160x160.png", "rarity": "SSR"}, {"id": "i068", "name": "旧1円金貨", "price": 60000, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1566-1-160x159.png", "rarity": "SR"}, {"id": "i069", "name": "新20円金貨", "price": 373200, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/07/mr-coins-shop_1556-160x155.png", "rarity": "SSR"}, {"id": "i070", "name": "新10円金貨", "price": 186500, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/1546-1-160x161.png", "rarity": "SSR"}, {"id": "i071", "name": "新5円金貨", "price": 90000, "type": "coin", "category": "近代金貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/30_1-160x160.png", "rarity": "SR"}, {"id": "i072", "name": "貿易銀", "price": 210000, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/mr-coins-shop_2171-160x162.png", "rarity": "SSR"}, {"id": "i073", "name": "新1円銀貨（新一円銀貨）", "price": 20000, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/mr-coins-shop_2019_1-160x157.png", "rarity": "SR"}, {"id": "i074", "name": "旧1円銀貨 明治3年（旧一円銀貨）", "price": 50000, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/mr-coins-shop_2169_1-160x160.png", "rarity": "SR"}, {"id": "i075", "name": "旭日竜50銭銀貨", "price": 2417, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/mr-coins-shop_819-160x159.png", "rarity": "N"}, {"id": "i076", "name": "竜50銭銀貨", "price": 2417, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/mr-coins-shop_815_1-160x161.png", "rarity": "N"}, {"id": "i077", "name": "旭日50銭銀貨（中丸50銭銀貨）", "price": 1793, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/mr-coins-shop_2124-160x161.png", "rarity": "N"}, {"id": "i078", "name": "小型50銭銀貨（小丸50銭銀貨）", "price": 837, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2088-1-160x160.png", "rarity": "N"}, {"id": "i079", "name": "旭日竜20銭銀貨（旭竜20銭銀貨）", "price": 895, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_828_4-1-160x159.png", "rarity": "N"}, {"id": "i080", "name": "旭日20銭銀貨", "price": 725, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/80a6559ce274dce09291a79943c69505-1-160x159.png", "rarity": "N"}, {"id": "i081", "name": "竜20銭銀貨", "price": 964, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_850_3-1-160x160.png", "rarity": "N"}, {"id": "i082", "name": "旭日竜10銭銀貨", "price": 578, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2023/03/asahiryu10sen_omote-160x161.webp", "rarity": "N"}, {"id": "i083", "name": "竜10銭銀貨", "price": 483, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2023/03/ryu10sen_omote-160x159.webp", "rarity": "N"}, {"id": "i084", "name": "旭日10銭銀貨", "price": 314, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2023/03/asahi10sen_omote-160x160.webp", "rarity": "N"}, {"id": "i085", "name": "旭日竜5銭銀貨", "price": 6000, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/9e81ab390724d6e548fbf93bd7b4a84e-1-160x159.png", "rarity": "R"}, {"id": "i086", "name": "旭日大字5銭銀貨", "price": 3000, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/4cd6285c401e5711b0cbc2aacada3a8c-1-160x161.png", "rarity": "R"}, {"id": "i087", "name": "竜5銭銀貨", "price": 500, "type": "coin", "category": "近代銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2059-1-160x164.png", "rarity": "N"}, {"id": "i088", "name": "菊5銭白銅貨", "price": 6000, "type": "coin", "category": "近代銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/5bad992eb26ce614bd8b3a5e9e902303-1-160x160.png", "rarity": "R"}, {"id": "i089", "name": "稲5銭白銅貨", "price": 100, "type": "coin", "category": "近代銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/c225cd17f225a0147b898c565c16bfc7-1-160x160.png", "rarity": "N"}, {"id": "i090", "name": "2銭銅貨 (竜2銭銅貨)", "price": 1000, "type": "coin", "category": "近代銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2078-1-160x160.png", "rarity": "N"}, {"id": "i092", "name": "稲1銭青銅貨", "price": 300, "type": "coin", "category": "近代銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2127-1-160x161.png", "rarity": "N"}, {"id": "i093", "name": "半銭銅貨", "price": 1000, "type": "coin", "category": "近代銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_377-1-160x159.png", "rarity": "N"}, {"id": "i094", "name": "1厘銅貨", "price": 100, "type": "coin", "category": "近代銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/07/7327a1d1f6686d263d60c20554a49eb7-1-160x159.png", "rarity": "N"}, {"id": "i117", "name": "1銭錫貨", "price": 2000, "type": "coin", "category": "近代アルミ・錫銭", "img": "https://antylink.jp/wp-content/uploads/2022/12/suzu1sen-omo-160x160.png", "rarity": "N"}, {"id": "i118", "name": "10円玉(昭和61年後期デザイン)", "price": 20000, "type": "coin", "category": "現行硬貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/syowa61-10yen-160x160.jpg", "rarity": "SR"}, {"id": "i119", "name": "10円玉（ギザ10）", "price": 10000, "type": "coin", "category": "現行硬貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/giza10-ura-160x160.webp", "rarity": "R"}, {"id": "i120", "name": "50円玉", "price": 500, "type": "coin", "category": "現行硬貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/50yen_ura-160x440.webp", "rarity": "N"}, {"id": "i124", "name": "桜100円白銅貨", "price": 30000, "type": "coin", "category": "現行硬貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/sakura100yen-omote-160x160.webp", "rarity": "SR"}, {"id": "i129", "name": "竜2銭銅貨エラー【陰打ち】", "price": 45000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/03/IMG_8912-cutout-160x159.png", "rarity": "SR"}, {"id": "i130", "name": "50円白銅貨 昭和43年【穴ズレ 】", "price": 60000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_0108-1-160x161.png", "rarity": "SR"}, {"id": "i131", "name": "50円白銅貨 昭和49年【穴ズレ】", "price": 25000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/02/batch_11202108171453371114825_w1541h1539-cutout-1-160x163.png", "rarity": "SR"}, {"id": "i132", "name": "50円白銅貨 昭和50年【穴ズレエラー】", "price": 190000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/96bf57028f3b911f22a28caade8c0d84-160x160.jpg", "rarity": "SSR"}, {"id": "i133", "name": "50円白銅貨 昭和58年【穴ズレ】", "price": 20000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/02/batch_11batch_2021081414441947827360_w1514h1512-cutout-1-160x160.png", "rarity": "SR"}, {"id": "i134", "name": "50円白銅貨 昭和50年【穴ナシ】", "price": 300000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/o0UVdNIcFuBqA4u1673156454_1673156471-160x157.jpg", "rarity": "SSR"}, {"id": "i135", "name": "50円白銅貨 昭和51年【穴ナシ】", "price": 600000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/12/9a612d4b86f42ce31fd14abc384b9cb8-160x160.png", "rarity": "LEGEND"}, {"id": "i136", "name": "菊穴ナシ50円ニッケル貨 昭和30年【メクレエラー】", "price": 13000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/3d3d6d5e75c146421d84e96a9469a21d-160x160.jpg", "rarity": "R"}, {"id": "i137", "name": "菊穴ナシ50円ニッケル貨 昭和31年【傾打エラー】", "price": 32000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/e9d4c61bee52fcef7c469d4fd8fd0e78-160x162.jpg", "rarity": "SR"}, {"id": "i138", "name": "菊50円ニッケル貨 昭和41年【穴ズレ】", "price": 35000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/02/batch_112021081714533773240663_w1699h1700-cutout-e1644637297279-160x162.png", "rarity": "SR"}, {"id": "i139", "name": "5円黄銅貨 昭和24年【穴ズレ】", "price": 7000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/02/batch_112021110614242609041696_w1633h1633-cutout-2-160x160.png", "rarity": "R"}, {"id": "i140", "name": "菊50円ニッケル貨 昭和39年【穴ズレエラー】", "price": 76000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/0e411a6fd363edaaa846e009c5a142bf-160x159.jpg", "rarity": "SR"}, {"id": "i141", "name": "5円黄銅貨 昭和33年【穴ズレ】", "price": 25000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/12/7293e197cc97bf9694a87d382c23b75e-160x160.png", "rarity": "SR"}, {"id": "i142", "name": "5円黄銅貨 昭和33年 【穴ズレエラー】", "price": 205000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/94d972b59525426e7fca115f5d8957d2-160x158.jpg", "rarity": "SSR"}, {"id": "i143", "name": "5円黄銅貨 昭和38年【穴ズレ】", "price": 12000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/error-5yen-S38-omote-160x160.png", "rarity": "R"}, {"id": "i144", "name": "5円黄銅貨 昭和41年 【穴ズレエラー】", "price": 108000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/8193fc46fa72ef4eddef6d863407b7e3-160x159.jpg", "rarity": "SSR"}, {"id": "i146", "name": "1円アルミ貨 昭和37年 【傾打エラー】", "price": 4000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/312d34aced8d0f4ddc62d71356da3663-160x158.jpg", "rarity": "R"}, {"id": "i147", "name": "10円青銅貨 昭和26年 【傾打エラー】", "price": 24000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/0061389cd21c8cd9666706aa37a8b3d0-160x161.jpg", "rarity": "SR"}, {"id": "i148", "name": "500円白銅貨 平成6年 【傾打エラー】", "price": 39000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/6e686531494a05322049966e6ed715ef-160x159.jpg", "rarity": "SR"}, {"id": "i149", "name": "守礼門 2千円札【JL記号エラー紙幣】", "price": 100000, "type": "note", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/c9ac1255c5c5f0ba7c33f62d5e7458ed-160x82.jpg", "rarity": "SSR"}, {"id": "i150", "name": "4次100円 【福耳／文字抜けエラー】", "price": 30000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/11/4th100yen_error1-160x92.webp", "rarity": "SR"}, {"id": "i151", "name": "4次100円 【福耳エラー】", "price": 25000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/0d33608293b3671d11a20c266ac3a451-160x106.jpg", "rarity": "SR"}, {"id": "i152", "name": "国会議事堂10円札 【印刷抜けエラー紙幣】", "price": 35000, "type": "note", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/6326106fd7993dd4f4e1e9a08d815282-160x89.jpg", "rarity": "SR"}, {"id": "i153", "name": "富士桜50銭 【裏写りエラー】", "price": 24000, "type": "coin", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/aa74c04e4bcf3dd5db08b70af2dd238a-160x100.jpg", "rarity": "SR"}, {"id": "i154", "name": "福沢諭吉一万円札【印刷ズレエラー】", "price": 30000, "type": "note", "category": "エラーコイン・紙幣", "img": "https://antylink.jp/wp-content/uploads/2023/01/f85afcb561fc1f146b793ea27216017a-160x77.jpg", "rarity": "SR"}, {"id": "i155", "name": "未発行 1銭陶貨（富士）", "price": 500, "type": "coin", "category": "試鋳貨（試作貨幣・未発行・不発行）", "img": "https://antylink.jp/wp-content/uploads/2023/06/tou1sen_omo-160x160.webp", "rarity": "N"}, {"id": "i156", "name": "未発行 5銭陶貨", "price": 25000, "type": "coin", "category": "試鋳貨（試作貨幣・未発行・不発行）", "img": "https://antylink.jp/wp-content/uploads/2023/03/IMG_8916-cutout-160x160.png", "rarity": "SR"}, {"id": "i157", "name": "未発行 10銭陶貨", "price": 40000, "type": "coin", "category": "試鋳貨（試作貨幣・未発行・不発行）", "img": "https://antylink.jp/wp-content/uploads/2023/03/IMG_8914-cutout-160x155.png", "rarity": "SR"}, {"id": "i159", "name": "明治2年1銭銅貨", "price": 400000, "type": "coin", "category": "試鋳貨（試作貨幣・未発行・不発行）", "img": "https://antylink.jp/wp-content/uploads/2023/06/M2-1sen-omo-160x160.webp", "rarity": "LEGEND"}, {"id": "i160", "name": "明治3年1銭銅貨", "price": 300000, "type": "coin", "category": "試鋳貨（試作貨幣・未発行・不発行）", "img": "https://antylink.jp/wp-content/uploads/2023/06/M3-1sen-omo-160x160.webp", "rarity": "SSR"}, {"id": "i165", "name": "文政小判金 （草文小判）", "price": 190000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/bunsei-koban-omote-160x300.webp", "rarity": "SSR"}, {"id": "i166", "name": "天保小判金（保字小判）", "price": 170000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpo-koban-omote-160x300.webp", "rarity": "SSR"}, {"id": "i167", "name": "元文小判金 （真文小判）", "price": 245000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/genbun-koban-omote-comp-160x282.webp", "rarity": "SSR"}, {"id": "i168", "name": "万延小判金（雛小判）", "price": 85000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/manen-koban-omote-160x276.webp", "rarity": "SR"}, {"id": "i171", "name": "安政小判金", "price": 450000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/ansei-koban-omote-160x302.webp", "rarity": "LEGEND"}, {"id": "i172", "name": "享保小判金", "price": 450000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/kyoho-koban-omote-160x284.webp", "rarity": "LEGEND"}, {"id": "i175", "name": "宝永小判金（乾字小判）", "price": 700000, "type": "coin", "category": "大判、小判", "img": "https://antylink.jp/wp-content/uploads/2021/08/houei-koban-omote-160x293.webp", "rarity": "LEGEND"}, {"id": "i180", "name": "安政一分銀（新一分）", "price": 2315, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/ansei-ichibugin-shinichibu-omote-160x239.webp", "rarity": "N"}, {"id": "i181", "name": "天保一分銀（古一分）", "price": 2315, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpou_itibugin-160x216.jpg", "rarity": "N"}, {"id": "i182", "name": "古南鐐二朱銀", "price": 6000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/konanryou2syugin-omote-160x268.webp", "rarity": "R"}, {"id": "i183", "name": "新南鐐二朱銀", "price": 4000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/shinnanryo2syugin-omote-160x259.webp", "rarity": "R"}, {"id": "i184", "name": "一朱銀(嘉永・明治)", "price": 800, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2023/11/kaei_isyugin1-160x194.webp", "rarity": "N"}, {"id": "i185", "name": "明治一分銀", "price": 5000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2024/08/IMG_0374-160x160.jpg", "rarity": "R"}, {"id": "i186", "name": "庄内一分銀", "price": 4000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2024/08/IMG_0378-160x160.jpg", "rarity": "R"}, {"id": "i187", "name": "文政南鐐一朱銀", "price": 3000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/bunseinanryo1syugin-omote-160x249.webp", "rarity": "R"}, {"id": "i188", "name": "明和五匁銀", "price": 100000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/meiwa5monmegin-omote-160x332.webp", "rarity": "SSR"}, {"id": "i189", "name": "安政二朱銀（貿易二朱）", "price": 90000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2021/08/ansei2syugin-omote-160x247.webp", "rarity": "SR"}, {"id": "i190", "name": "秋田笹一分銀", "price": 80000, "type": "coin", "category": "一分銀、一朱銀、二朱銀など", "img": "https://antylink.jp/wp-content/uploads/2025/07/43df8b77ae08f65baa8ace315c8b6996-1-160x160.jpg", "rarity": "SR"}, {"id": "i191", "name": "安政二分判金（安政二分金）", "price": 20400, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/anseinibukin-omote-160x160.webp", "rarity": "SR"}, {"id": "i192", "name": "万延一分判金（ハネ分）", "price": 70000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/manen-ichibubankin-omote-160x275.webp", "rarity": "SR"}, {"id": "i193", "name": "文政二分判金（真文二分）", "price": 60000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/bunsei-nibubankin-omote-160x264.webp", "rarity": "SR"}, {"id": "i194", "name": "文政一分判金（草文一分）", "price": 35200, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/bunsei-ichibubankin-omote-160x247.webp", "rarity": "SR"}, {"id": "i195", "name": "万延二分判金（万延二分金、ハネ分）", "price": 30000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/manen2bubankin-omote-160x240.webp", "rarity": "SR"}, {"id": "i196", "name": "明治二分判金（明治二分金、止メ分）", "price": 9400, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/meijinibubankin-omote-160x160.webp", "rarity": "R"}, {"id": "i197", "name": "慶長一分判金", "price": 95000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/keicho-itibubankin-omote-160x160.webp", "rarity": "SR"}, {"id": "i198", "name": "元禄一分判金", "price": 110000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/genroku-itibubankin-omote-160x160.webp", "rarity": "SSR"}, {"id": "i199", "name": "宝永一分判金（乾字一分判金）", "price": 70000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/houei-ichibubankin-omote-160x258.webp", "rarity": "SR"}, {"id": "i200", "name": "元禄二朱判金", "price": 120000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/genroku-nisyukin-omote-160x160.webp", "rarity": "SSR"}, {"id": "i201", "name": "天保一分判金", "price": 35000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpouitibubankin-omote-160x160.webp", "rarity": "SR"}, {"id": "i202", "name": "安政一分判金（正字一分）", "price": 180000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/ansei-ichibubankin1-omote-160x160.webp", "rarity": "SSR"}, {"id": "i203", "name": "享保一分判金", "price": 80900, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/kyoho-ichibubankin-omote-160x264.webp", "rarity": "SR"}, {"id": "i204", "name": "元文一分判金（真文一分）", "price": 37400, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/genbun-itibubankin-ura-160x160.webp", "rarity": "SR"}, {"id": "i205", "name": "文政二分判金（草文二分）", "price": 50000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/bunsei-nibubankin-soubun-omote-160x284.webp", "rarity": "SR"}, {"id": "i206", "name": "文政一朱判金（角一朱）", "price": 18000, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/bunsei-issyubankin-omote-160x158.webp", "rarity": "R"}, {"id": "i207", "name": "天保二朱判金（古二朱）", "price": 6500, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpo-nisyubankin-omote-1-160x160.webp", "rarity": "R"}, {"id": "i208", "name": "万延二朱判金（新二朱）", "price": 3500, "type": "coin", "category": "二分金、一分金、二朱金など", "img": "https://antylink.jp/wp-content/uploads/2021/08/manen-nisyubankin-omote-1-160x160.webp", "rarity": "R"}, {"id": "i209", "name": "元文丁銀", "price": 30000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/genbun-chogin-omote-160x441.webp", "rarity": "SR"}, {"id": "i210", "name": "天保丁銀", "price": 20000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpo-chogin-omote-160x498.webp", "rarity": "SR"}, {"id": "i211", "name": "文政丁銀", "price": 30000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2023/11/bunsei-chogin-omote-160x417.webp", "rarity": "SR"}, {"id": "i212", "name": "安政丁銀", "price": 20000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/ansei-chogin-omote-160x434.webp", "rarity": "SR"}, {"id": "i213", "name": "享保丁銀", "price": 40000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2023/11/kyouhou-chogin-omote-160x320.webp", "rarity": "SR"}, {"id": "i214", "name": "正徳丁銀", "price": 50000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2023/11/chougin-kyouhou-omo-e1700729528482-75x150.webp", "rarity": "SR"}, {"id": "i215", "name": "元文豆板銀", "price": 2000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/genbun-mameitagin-omote-160x156.webp", "rarity": "N"}, {"id": "i216", "name": "天保豆板銀", "price": 2000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpo-mameitagin-omote-160x138.webp", "rarity": "N"}, {"id": "i217", "name": "安政豆板銀", "price": 2000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/ansei-mameitagin-omote-160x160.webp", "rarity": "N"}, {"id": "i218", "name": "享保豆板銀", "price": 4000, "type": "coin", "category": "丁銀、豆板銀", "img": "https://antylink.jp/wp-content/uploads/2021/08/kyouhou-mameitagin-omote1-160x168.webp", "rarity": "R"}, {"id": "i219", "name": "仙台通宝", "price": 11000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2025/07/a5080e6d4dd1a5ef131db951f13678f2-160x160.jpg", "rarity": "R"}, {"id": "i220", "name": "但馬南鐐銀", "price": 100000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2025/07/tazimananryougin-omote-min-160x261.png", "rarity": "SSR"}, {"id": "i221", "name": "水戸虎銭（富国強兵の刻印）", "price": 14000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2025/06/1-160x160.jpg", "rarity": "R"}, {"id": "i222", "name": "水戸大黒銭（寿比南山の刻印）", "price": 25000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2025/06/3-160x160.png", "rarity": "SR"}, {"id": "i223", "name": "甲州金（甲州一分金、甲州一朱金、甲州二朱金）", "price": 70000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2019/08/mr-coins-shop_1558-150x150.jpeg", "rarity": "SR"}, {"id": "i224", "name": "秋田四匁六分銀判", "price": 30000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_6988-609x1024-1-160x269.png", "rarity": "SR"}, {"id": "i225", "name": "秋田九匁二分銀判", "price": 60000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200223_16074748-2-160x228.png", "rarity": "SR"}, {"id": "i226", "name": "盛岡八匁銀判", "price": 140000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2024/01/morioka8monme2-omo-160x213.webp", "rarity": "SSR"}, {"id": "i227", "name": "仙台小槌銀", "price": 100000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2024/01/sendaikozuchi-omo-160x160.webp", "rarity": "SSR"}, {"id": "i228", "name": "秋田笹一分銀", "price": 80000, "type": "coin", "category": "地方貨幣", "img": "https://antylink.jp/wp-content/uploads/2025/07/43df8b77ae08f65baa8ace315c8b6996-1-160x160.jpg", "rarity": "SR"}, {"id": "i229", "name": "寛永通宝（寛永通寶）", "price": 5, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2022/02/kanei-omote-160x160.png", "rarity": "N"}, {"id": "i230", "name": "天保通宝", "price": 400, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/tenpotsuho-omote-160x241.webp", "rarity": "N"}, {"id": "i231", "name": "文久永宝（文久永寶）", "price": 5, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2023/06/bunkyu-omo-160x160.webp", "rarity": "N"}, {"id": "i232", "name": "宝永通宝（寶永通寶）", "price": 400, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1652-1-160x158.png", "rarity": "N"}, {"id": "i233", "name": "琉球通宝 当百", "price": 3000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1051-1-160x232.png", "rarity": "R"}, {"id": "i234", "name": "琉球通宝 半銖", "price": 7000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200223_16084454-2-160x162.png", "rarity": "R"}, {"id": "i235", "name": "秋田鍔銭", "price": 3000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_19-1-160x177.png", "rarity": "R"}, {"id": "i236", "name": "慶長通宝", "price": 4000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/i-img1130x1130-1584690347xqsvfm13168-1-160x162.png", "rarity": "R"}, {"id": "i237", "name": "永楽通宝（永楽通寶）", "price": 5, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2024/04/eiraku_tsuho01-160x157.png", "rarity": "N"}, {"id": "i238", "name": "世高通宝", "price": 2000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/i-img1116x1116-15846084723tsrlh996608-1-160x163.png", "rarity": "N"}, {"id": "i239", "name": "大世通宝", "price": 3000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/i-img1097x1097-1584608870oa85re915780-1-160x161.png", "rarity": "R"}, {"id": "i240", "name": "平安通宝", "price": 1500, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/i-img1149x1149-1584690808lojebd10289-1-160x158.png", "rarity": "N"}, {"id": "i241", "name": "和同開珎（わどうかいちん）", "price": 40000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/wadokaichin-omote-160x164.webp", "rarity": "SR"}, {"id": "i242", "name": "萬年通宝（まんねんつうほう）", "price": 30000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/21-160x160.jpg", "rarity": "SR"}, {"id": "i243", "name": "神功開宝（じんこうかいほう）", "price": 20000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/14cf90345cd5f9f34fca5d24d1772b5f-160x160.png", "rarity": "SR"}, {"id": "i244", "name": "隆平永宝（りゅうへいえいほう）", "price": 20000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/6-160x160.jpg", "rarity": "SR"}, {"id": "i245", "name": "富壽神宝（ふじゅしんぽう）", "price": 20000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/26-160x160.jpg", "rarity": "SR"}, {"id": "i246", "name": "承和昌宝（じょうわしょうほう）", "price": 40000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/f804d3c30d69e5c66a3224d6c6cc6d5a-160x161.png", "rarity": "SR"}, {"id": "i247", "name": "長年大宝（ちょうねんたいほう）", "price": 50000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/11-160x160.jpg", "rarity": "SR"}, {"id": "i248", "name": "饒益神宝（にょうえきしんぽう）", "price": 400000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nyoueki-omo-160x160.webp", "rarity": "LEGEND"}, {"id": "i249", "name": "貞観永宝（じょうがんえいほう）", "price": 25000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/i-img1200x1193-1596083942wtdfmw19956-1-160x158.png", "rarity": "SR"}, {"id": "i250", "name": "寛平大宝（かんぴょうたいほう）", "price": 25000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/16-160x160.jpg", "rarity": "SR"}, {"id": "i251", "name": "延喜通宝（えんぎつうほう）", "price": 15000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/4a40a95948796a04f43c88c4bed22019-160x167.png", "rarity": "R"}, {"id": "i252", "name": "乹元大宝（けんげんたいほう）", "price": 80000, "type": "coin", "category": "穴銭（銭貨）", "img": "https://antylink.jp/wp-content/uploads/2021/08/56-160x160.jpg", "rarity": "SR"}, {"id": "i253", "name": "聖徳太子 一万円札", "price": 45000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/75a5a23f16bf1596919ba940e1554878-160x78.png", "rarity": "SR"}, {"id": "i254", "name": "聖徳太子 5000円札", "price": 40000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2098-1-160x77.png", "rarity": "SR"}, {"id": "i255", "name": "聖徳太子 千円札（B号券）", "price": 2500, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/9f573a8fc86e5d90529606bb1f2ec4e5-160x76.png", "rarity": "N"}, {"id": "i257", "name": "岩倉具視 新500円札（C号券）", "price": 25000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/4961e04168232c4fedff3af648d45b0c-160x74.png", "rarity": "SR"}, {"id": "i258", "name": "板垣退助100円札（日本銀行券B号100円）", "price": 3000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/itagaki100yen-omote-160x85.webp", "rarity": "R"}, {"id": "i259", "name": "高橋50円札（B号券）", "price": 2500, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2230-1-160x76.png", "rarity": "N"}, {"id": "i260", "name": "福沢諭吉 旧一万円札（ホログラム無し）", "price": 17000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_630-1-160x77.png", "rarity": "R"}, {"id": "i261", "name": "福沢諭吉 新一万円札（ホログラムあり）", "price": 16000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2240-crop-160x76.png", "rarity": "R"}, {"id": "i262", "name": "新渡戸稲造 5000円札", "price": 25000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20201112_18291405-1-160x78.png", "rarity": "SR"}, {"id": "i263", "name": "樋口一葉 5000円札", "price": 25000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/06/higuchi-omo-160x85.jpg", "rarity": "SR"}, {"id": "i264", "name": "伊藤博文 千円札", "price": 8500, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/b2b7bb0298ffb5288b443ba4508740a2-160x75.png", "rarity": "R"}, {"id": "i265", "name": "夏目漱石 千円札", "price": 8500, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_465-1-160x81.png", "rarity": "R"}, {"id": "i266", "name": "渋沢栄一 一万円札", "price": 300000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2024/06/10000-yen-bill-160x76.jpg", "rarity": "SSR"}, {"id": "i267", "name": "北里柴三郎 千円札", "price": 260000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2024/06/1000-yen-bill-160x76.jpg", "rarity": "SSR"}, {"id": "i268", "name": "津田梅子 五千円札", "price": 280000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2024/06/5000-yen-bill-160x76.jpg", "rarity": "SSR"}, {"id": "i269", "name": "野口英世1000円札", "price": 8500, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/c99393ca0b5d12b86072fac421393104-160x83.jpg", "rarity": "R"}, {"id": "i270", "name": "守礼門 2000円札", "price": 60000, "type": "note", "category": "現行紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2100-1-160x80.png", "rarity": "SR"}, {"id": "i271", "name": "聖徳太子 4次100円札（日本銀行券A号100円）", "price": 500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/4ji100-1-160x95.jpg", "rarity": "N"}, {"id": "i272", "name": "日本銀行券A号10円札（国会議事堂10円・紙幣）", "price": 50, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/e2c66c5b804066d7dd7776a354b4e53b-160x89.png", "rarity": "N"}, {"id": "i273", "name": "改正兌換券5円（2次5円）｜菅原道真", "price": 1500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/b722a542731b5df67c911f53a60c7e56-160x90.png", "rarity": "N"}, {"id": "i274", "name": "日本銀行券A号5円（彩紋5円、紋様5円）", "price": 300, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2234-1-160x82.png", "rarity": "N"}, {"id": "i276", "name": "再改正不換紙幣10円札（4次10円）｜和気清麻呂", "price": 7000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/4ji10en-1-160x93.jpg", "rarity": "R"}, {"id": "i277", "name": "聖徳太子 3次100円札（改正不換紙幣100円）", "price": 10000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/3ji100-1-160x94.jpg", "rarity": "R"}, {"id": "i278", "name": "改正不換紙幣10円札（3次10円）｜和気清麻呂", "price": 1500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/3ji10en-1-160x93.jpg", "rarity": "N"}, {"id": "i279", "name": "改正不換紙幣5円（4次5円）｜菅原道真", "price": 7000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/kaiseifukan5ensugawara-omote-160x90.webp", "rarity": "R"}, {"id": "i280", "name": "改正不換紙幣1円（中央武内1円）", "price": 500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2231-2-160x92.png", "rarity": "N"}, {"id": "i281", "name": "聖徳太子 2次100円札（不換紙幣100円）", "price": 7000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/2ji100-1-160x93.jpg", "rarity": "R"}, {"id": "i282", "name": "不換紙幣10円札（2次10円）｜和気清麻呂", "price": 500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/2ji10en-2-1-160x92.jpg", "rarity": "N"}, {"id": "i283", "name": "不換紙幣5円（3次5円）｜菅原道真", "price": 1500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20201011_17065950-1-160x100.png", "rarity": "N"}, {"id": "i284", "name": "改正兌換券200円（藤原200円）", "price": 20000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_1570-1-160x93.png", "rarity": "SR"}, {"id": "i285", "name": "大正兌換銀行券5円（大正武内5円）", "price": 35000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17310301-1-160x91.png", "rarity": "SR"}, {"id": "i286", "name": "兌換券200円（裏赤200円）", "price": 150000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17521699-1-160x84.png", "rarity": "SSR"}, {"id": "i287", "name": "聖徳太子 1次100円札（兌換券100円）", "price": 8000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/1ji100-1-1-160x95.jpg", "rarity": "R"}, {"id": "i288", "name": "兌換券20円（タテ書き20円）", "price": 60000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_468-1-160x91.png", "rarity": "SR"}, {"id": "i289", "name": "兌換券10円札（1次10円）｜和気清麻呂", "price": 1000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/1ji10en-1-160x94.jpg", "rarity": "N"}, {"id": "i290", "name": "兌換券5円（1次5円）｜菅原道真", "price": 3500, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/8d5c0d3cdf5eb784e91474103bc92263-160x92.png", "rarity": "R"}, {"id": "i293", "name": "大正兌換銀行券20円（横書き20円）", "price": 270000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_97-1-160x93.png", "rarity": "SSR"}, {"id": "i294", "name": "大正兌換銀行券10円札（左和気10円）", "price": 35000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2270-1-160x95.png", "rarity": "SR"}, {"id": "i295", "name": "兌換券甲号1000円（日本武尊1000円）", "price": 250000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17232289-1-160x93.png", "rarity": "SSR"}, {"id": "i296", "name": "大正兌換銀行券1円（アラビア数字1円）", "price": 100, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/cebc3fb628040600cc104d00374b34f6-160x94.jpg", "rarity": "N"}, {"id": "i297", "name": "乙号兌換銀行券5円（透かし大黒5円）｜菅原道真", "price": 250000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17491224-1-160x93.png", "rarity": "SSR"}, {"id": "i298", "name": "裏紫100円札（甲号兌換銀行券100円）", "price": 700000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/uramurasaki100omote-1-160x93.webp", "rarity": "LEGEND"}, {"id": "i299", "name": "甲号兌換銀行券10円（裏猪10円札・紙幣）", "price": 550000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17550755-1-160x97.png", "rarity": "LEGEND"}, {"id": "i300", "name": "甲号兌換銀行券5円（中央武内5円）", "price": 280000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17281845-1-160x95.png", "rarity": "SSR"}, {"id": "i302", "name": "改造兌換銀行券10円札（表猪10円）", "price": 850000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17574002-1-160x95.png", "rarity": "LEGEND"}, {"id": "i303", "name": "改造兌換銀行券5円（分銅5円）｜菅原道真", "price": 800000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/6b72de4a28ec0c18ee9d837e2e1798d8-160x96.png", "rarity": "LEGEND"}, {"id": "i304", "name": "改造兌換銀行券1円（漢数字1円）", "price": 30000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2263-1-160x95.png", "rarity": "SR"}, {"id": "i306", "name": "旧兌換銀行券10円札（大黒10円）", "price": 800000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2022/03/dakan-omo-160x97.jpg", "rarity": "LEGEND"}, {"id": "i307", "name": "旧兌換銀行券5円（裏大黒5円）", "price": 800000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_83-1-160x92.png", "rarity": "LEGEND"}, {"id": "i308", "name": "旧兌換銀行券1円（大黒1円）", "price": 150000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_img20200610_17161557-scaled-1-1-160x94.png", "rarity": "SSR"}, {"id": "i309", "name": "改造紙幣10円札（神功皇后10円）", "price": 800000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_81-1-160x91.png", "rarity": "LEGEND"}, {"id": "i310", "name": "改造紙幣5円（神功皇后5円）", "price": 750000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/0b64850b8da22ef7141533264b6f8de5-160x93.jpg", "rarity": "LEGEND"}, {"id": "i311", "name": "改造紙幣1円（神功皇后1円）", "price": 250000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/11/3d20478efa2bcf3ea3f5f37d7b4b8e59-160x95.png", "rarity": "SSR"}, {"id": "i312", "name": "新国立銀行券5円（かじや5円）", "price": 150000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_2255-1-160x81.png", "rarity": "SSR"}, {"id": "i313", "name": "新国立銀行券1円（水兵1円）", "price": 100000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/mr-coins-shop_75-1-160x77.png", "rarity": "SSR"}, {"id": "i316", "name": "旧国立銀行券5円", "price": 400000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/7bcb9f0b4b1c3741c57683a55da32ff3-160x69.png", "rarity": "LEGEND"}, {"id": "i317", "name": "旧国立銀行券2円", "price": 200000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/21c88551606d582ba5f0b060e60619fb-160x67.png", "rarity": "SSR"}, {"id": "i318", "name": "旧国立銀行券1円", "price": 100000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_18003599-1-160x68.png", "rarity": "SSR"}, {"id": "i321", "name": "明治通宝10円札", "price": 550000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/meijitsuho10ensatsu-omote-160x244.webp", "rarity": "LEGEND"}, {"id": "i322", "name": "明治通宝5円札", "price": 500000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/meijitsuho5ensatsu-omote-160x242.webp", "rarity": "LEGEND"}, {"id": "i323", "name": "明治通宝2円札", "price": 180000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/meijitsuho2ensatsu-omote-160x256.webp", "rarity": "SSR"}, {"id": "i324", "name": "明治通宝1円札", "price": 50000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/meijitsuho1ensatsu-omote-160x250.webp", "rarity": "SR"}, {"id": "i325", "name": "明治通宝半円札", "price": 30000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/meijitsuhohanensatsu-omote-160x259.webp", "rarity": "SR"}, {"id": "i326", "name": "明治通宝20銭", "price": 25000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/1081517a1a7cea7a74c12d6c14a984d1-160x264.jpg", "rarity": "SR"}, {"id": "i328", "name": "明治通宝10銭", "price": 20000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/9cbc64ad042510f657607d5238fc8e35-160x261.jpg", "rarity": "SR"}, {"id": "i329", "name": "日本銀行券A号5銭（梅5銭）", "price": 100, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/57ad898d50ce74d23b92036c5d6bea20-160x84.jpg", "rarity": "N"}, {"id": "i331", "name": "政府紙幣50銭（富士桜50銭）", "price": 300, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/seifu50sen-omote-160x100.webp", "rarity": "N"}, {"id": "i335", "name": "大正小額紙幣50銭", "price": 2000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/80526b198dd01e776a29f67f82df6970-160x101.jpg", "rarity": "N"}, {"id": "i336", "name": "大正小額紙幣20銭", "price": 4000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/0f6dc36d4871c192f7fe2cbdc87c225d-160x101.jpg", "rarity": "R"}, {"id": "i337", "name": "大正小額紙幣10銭", "price": 400, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/230291ba45d3691b82668071dff0bf8d-160x100.jpg", "rarity": "N"}, {"id": "i338", "name": "改造紙幣50銭（大蔵卿50銭）", "price": 150000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/8abfaef5c9d7d11021bb2449f686fae5-160x102.jpg", "rarity": "SSR"}, {"id": "i339", "name": "改造紙幣20銭（大蔵卿20銭）", "price": 35000, "type": "note", "category": "近代紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/08/66bda2b71c5ce12bb08fba69a37ad77d-160x102.jpg", "rarity": "SR"}, {"id": "i340", "name": "承恵社札半円", "price": 70000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/shoukeisya-omo-160x160.webp", "rarity": "SR"}, {"id": "i341", "name": "承恵社札1円", "price": 90000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/shoukeisya-1yen-omo-160x160.webp", "rarity": "SR"}, {"id": "i342", "name": "西郷札10円", "price": 100000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/saigosatsu-10en-omote-160x250.webp", "rarity": "SSR"}, {"id": "i343", "name": "西郷札5円", "price": 30000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/saigosatsu-5en-omote-160x261.webp", "rarity": "SR"}, {"id": "i344", "name": "西郷札1円", "price": 20000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/saigosatsu-1en-omote-160x272.webp", "rarity": "SR"}, {"id": "i345", "name": "西郷札50銭", "price": 20000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/img20200610_17361126-1-160x241.jpg", "rarity": "SR"}, {"id": "i346", "name": "西郷札20銭", "price": 25000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/saigosatsu-20sen-omote-160x261.webp", "rarity": "SR"}, {"id": "i348", "name": "日露戦争軍票 銀10円", "price": 280000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/b92db55c7e8a45c31f8ccf2f6bfd571d-160x229.jpg", "rarity": "SSR"}, {"id": "i349", "name": "西郷札10銭", "price": 25000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/saigosatsu-10sen-omote-160x260.webp", "rarity": "SR"}, {"id": "i350", "name": "日露戦争軍票 銀5円", "price": 220000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/f0de4cc692bde5b0870504c392592d03-160x226.jpg", "rarity": "SSR"}, {"id": "i351", "name": "日露戦争軍票 銀1円", "price": 28000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nichiro-gin1en-omote-160x228.webp", "rarity": "SR"}, {"id": "i352", "name": "日露戦争軍票 銀50銭", "price": 13000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/b11cf400a94f18c48b45c849595caab8-160x231.jpg", "rarity": "R"}, {"id": "i353", "name": "日露戦争軍票 銀20銭", "price": 8000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nichiro-gin20sen-omote-160x238.webp", "rarity": "R"}, {"id": "i354", "name": "日露戦争軍票 銀10銭", "price": 2500, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nichiro-gin10sen-omote-160x236.webp", "rarity": "N"}, {"id": "i357", "name": "青島出兵軍票 銀1円", "price": 160000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/0046e6236c2bb13f24d22b407fd739fc-160x227.jpg", "rarity": "SSR"}, {"id": "i358", "name": "青島出兵軍票 銀50銭", "price": 100000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/2c5032b0edfb020c8c61ed1dc7e00faf-160x233.jpg", "rarity": "SSR"}, {"id": "i359", "name": "青島出兵軍票 銀20銭", "price": 70000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/43fa51a5dbd901ab13b009ff1766ce69-160x236.jpg", "rarity": "SR"}, {"id": "i360", "name": "青島出兵軍票 銀10銭", "price": 40000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/a235417ad398777bbba461667ce94295-160x238.jpg", "rarity": "SR"}, {"id": "i361", "name": "シベリア出兵軍票 金10円", "price": 400000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/Siberia-10yen--160x227.webp", "rarity": "LEGEND"}, {"id": "i362", "name": "シベリア出兵軍票 金5円", "price": 300000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/a541f09e0634485b190a6cba71bd4057-160x224.jpg", "rarity": "SSR"}, {"id": "i363", "name": "シベリア出兵軍票 金50銭", "price": 30000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/shiberia-kin50sen-omote-160x226.webp", "rarity": "SR"}, {"id": "i364", "name": "シベリア出兵軍票 金1円", "price": 50000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/715baab50e0194e35142a4e29dc3e808-160x223.jpg", "rarity": "SR"}, {"id": "i365", "name": "シベリア出兵軍票 金20銭", "price": 23000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/shiberia-kin20sen-omote-160x227.webp", "rarity": "SR"}, {"id": "i366", "name": "シベリア出兵軍票 金10銭", "price": 12000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/shiberia-kin10sen-omote-160x228.webp", "rarity": "R"}, {"id": "i367", "name": "日華事変軍票 甲号10円", "price": 160000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/e59af76e662267bf52fa4362a1472049-160x247.jpg", "rarity": "SSR"}, {"id": "i368", "name": "日華事変軍票 甲号5円", "price": 120000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/e62156b18af4a02fee2fab5a37055402-160x252.jpg", "rarity": "SSR"}, {"id": "i369", "name": "日華事変軍票 甲号1円", "price": 10000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nikkajihen-1en-160x259.webp", "rarity": "R"}, {"id": "i370", "name": "日華事変軍票 甲号50銭", "price": 8000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nikkajihen-50sen-omote-160x256.webp", "rarity": "R"}, {"id": "i371", "name": "日華事変軍票 甲号10銭", "price": 2000, "type": "note", "category": "軍用手票（軍票）", "img": "https://antylink.jp/wp-content/uploads/2021/08/nikkajihen-10sen-omote-160x267.webp", "rarity": "N"}, {"id": "i372", "name": "パンダ銀貨(10元)", "price": 300000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2025/07/panda-omote-160x160.jpg", "rarity": "SSR"}, {"id": "i373", "name": "中華民国 壹圓銀貨（袁世凱 1ドル銀貨）", "price": 13000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/en-minkoku3-omo-160x160.png", "rarity": "R"}, {"id": "i374", "name": "中華民国 開国記念幣 壹圓銀貨", "price": 7787, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2022/06/kaikokukinen-ura-160x160.png", "rarity": "R"}, {"id": "i375", "name": "中華民国 壹圓銀貨（孫文ジャンク1ドル銀貨）", "price": 20000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/9-2-160x161.png", "rarity": "SR"}, {"id": "i376", "name": "光緒元寶（北洋造）", "price": 50000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2022/06/hokuyou-omote-160x160.png", "rarity": "SR"}, {"id": "i377", "name": "大清銀幣（壹圓銀貨）", "price": 80000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2022/07/daishinginpei_omote-160x160.webp", "rarity": "SR"}, {"id": "i378", "name": "四川銀幣（壹圓銀貨）", "price": 20000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2022/07/shisen-omo-160x160.png", "rarity": "SR"}, {"id": "i379", "name": "中圓銀貨", "price": 70000, "type": "coin", "category": "中国銀貨、銅貨", "img": "https://antylink.jp/wp-content/uploads/2022/06/chuen-ura-160x160.png", "rarity": "SR"}, {"id": "i380", "name": "咸豊通宝", "price": 300000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/kanpou-tuho-100-omote-160x160.webp", "rarity": "SSR"}, {"id": "i381", "name": "咸豊元宝", "price": 150000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/kanpou-genpou-100-omote-160x160.webp", "rarity": "SSR"}, {"id": "i382", "name": "咸豊重宝", "price": 8000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/kanpo-jyuho-50omote-160x160.webp", "rarity": "R"}, {"id": "i383", "name": "太平天国 古銭", "price": 150000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/taiheitengoku-omote-160x160.webp", "rarity": "SSR"}, {"id": "i384", "name": "方足布（ほうそくふ）", "price": 40000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/housoku-enken-an-160x160.jpg", "rarity": "SR"}, {"id": "i385", "name": "空首布（くうしゅふ）", "price": 50000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/2-160x160.jpg", "rarity": "SR"}, {"id": "i386", "name": "古文銭（円銭・蟻鼻銭・半両銭・五銖銭）", "price": 10000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/kakijisen-omote-160x160.webp", "rarity": "R"}, {"id": "i387", "name": "刀銭（刀幣・刀貨）", "price": 180000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/tousen-reppin-160x160.jpg", "rarity": "SSR"}, {"id": "i388", "name": "大観通宝", "price": 12000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/taikantsuho-omote-160x160.webp", "rarity": "R"}, {"id": "i389", "name": "花銭", "price": 5000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2022/02/hanasen-omote-hakke-160x160.jpg", "rarity": "R"}, {"id": "i390", "name": "洪武通宝", "price": 42000, "type": "coin", "category": "中国古銭", "img": "https://antylink.jp/wp-content/uploads/2024/08/koubu-tuho-omote-160x160.webp", "rarity": "SR"}, {"id": "i391", "name": "メイプルリーフ金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/62-160x160.jpg", "rarity": "LEGEND"}, {"id": "i392", "name": "クルーガーランド金貨", "price": 715900, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/04/KRUGERRAND_gold-160x160.png", "rarity": "LEGEND"}, {"id": "i393", "name": "アメリカンイーグル金貨", "price": 715900, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/04/eagle_gold-160x160.png", "rarity": "LEGEND"}, {"id": "i394", "name": "オーストリア ウィーンハーモニー金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/58-160x160.jpg", "rarity": "LEGEND"}, {"id": "i395", "name": "ソブリン金貨", "price": 21100, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/04/sovereign_gold_coin-160x160.png", "rarity": "SR"}, {"id": "i396", "name": "イギリス ブリタニア金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/06/buritania01-160x154.webp", "rarity": "LEGEND"}, {"id": "i397", "name": "中国 パンダ金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/04/panda-kinka-omote-160x160.webp", "rarity": "LEGEND"}, {"id": "i398", "name": "オーストラリア カンガルー金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/72-160x160.jpg", "rarity": "LEGEND"}, {"id": "i399", "name": "オーストラリア シドニーオリンピック記念金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/05/sydney_olympic_gold_omote-160x160.png", "rarity": "LEGEND"}, {"id": "i400", "name": "アメリカ インディアン金貨", "price": 20802, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2022/01/5a58a83a16d7fe74f06325fc0374a6f0-e1641787854231-160x158.png", "rarity": "SR"}, {"id": "i401", "name": "イギリス ピーターラビット金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/05/peter_rabbit_gold02-160x160.png", "rarity": "LEGEND"}, {"id": "i402", "name": "マン島 キャット金貨", "price": 739500, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2021/09/68-160x160.jpg", "rarity": "LEGEND"}, {"id": "i403", "name": "アメリカ リバティヘッド金貨", "price": 20802, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/05/10DOLLARS_LIBERTY_HEAD01-160x160.png", "rarity": "SR"}, {"id": "i404", "name": "アメリカ バッファロー金貨", "price": 23776, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/07/Buffalo-160x75.png", "rarity": "SR"}, {"id": "i405", "name": "フランス ナポレオン金貨", "price": 20802, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/07/01-160x160.png", "rarity": "SR"}, {"id": "i406", "name": "ロンドンオリンピック記念金貨", "price": 21100, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/08/london_gold02-160x161.png", "rarity": "SR"}, {"id": "i407", "name": "ソウルオリンピック記念金貨", "price": 715900, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2025/07/1cf03bca07d4d43c456d9709d0e3b892-160x160.jpg", "rarity": "LEGEND"}, {"id": "i408", "name": "クック諸島 イルカ金貨（ラッセン）", "price": 23776, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/09/dolphin01-160x160.png", "rarity": "SR"}, {"id": "i409", "name": "オーストラリア ナゲット金貨", "price": 23776, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/07/nugget_gold-160x81.png", "rarity": "SR"}, {"id": "i410", "name": "マレーシア リンギット金貨（黄金の鹿）", "price": 23776, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/07/KijangEmas-160x79.png", "rarity": "SR"}, {"id": "i411", "name": "オランダ グルデン金貨", "price": 20802, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/08/Gulden01-160x159.png", "rarity": "SR"}, {"id": "i412", "name": "イタリア王国建国50周年記念金貨", "price": 20802, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/08/italy50kinka-omote-160x162.webp", "rarity": "SR"}, {"id": "i413", "name": "スイス フランケン金貨（ヘルヴェティア共和国）", "price": 20802, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/08/franken-kinka-omote-160x160.webp", "rarity": "SR"}, {"id": "i414", "name": "ペルー リーブラ金貨", "price": 21100, "type": "coin", "category": "外国金貨", "img": "https://antylink.jp/wp-content/uploads/2024/07/libra-160x86.png", "rarity": "SR"}, {"id": "i425", "name": "アメリカ シルバーイーグル1ドル銀貨（United States American Silver Eagle 1 Dollar）", "price": 9266, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4840-1-160x160.png", "rarity": "R"}, {"id": "i426", "name": "アメリカ モルガン1ドル銀貨 (United States Morgan Silver Dollars)", "price": 6376, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/07/6-2-1-160x162.png", "rarity": "R"}, {"id": "i427", "name": "アメリカ ピース1ドル銀貨", "price": 6376, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/4-2-160x161.png", "rarity": "R"}, {"id": "i428", "name": "アメリカ ロサンゼルスオリンピック1ドル銀貨（1984 Olympic Games in Los Angeles 1 Dollar）", "price": 6376, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_2872-1-1536x1536-1-160x160.jpg", "rarity": "R"}, {"id": "i429", "name": "アメリカ 自由の女神100年祭記念1ドル銀貨（Statue of Liberty）", "price": 6376, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/06/ELLIS-1dollar-omo-160x160.webp", "rarity": "R"}, {"id": "i430", "name": "アメリカ ケネディ1/2ドル銀貨", "price": 2989, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/1-2-160x160.jpg", "rarity": "N"}, {"id": "i431", "name": "アメリカ フランクリン1/2ドル銀貨（United States Franklin Half Dollars）", "price": 2989, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/2-2-160x159.png", "rarity": "N"}, {"id": "i432", "name": "アメリカ リバティウォーキング1/2ドル銀貨（United States Liberty Walking Half Dollars）", "price": 2989, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/3-1-160x161.png", "rarity": "N"}, {"id": "i433", "name": "アメリカ アイゼンハワー1ドル銀貨（United States Eisenhower Dollars）", "price": 1961, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_5236-1536x1536-1-1-160x160.png", "rarity": "N"}, {"id": "i434", "name": "フランス銀貨", "price": 7174, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/12/France-10fr-ura-160x160.jpg", "rarity": "R"}, {"id": "i435", "name": "オーストリア銀貨", "price": 5034, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/12/MariaTheresia-ginka-omote-160x161.jpg", "rarity": "R"}, {"id": "i436", "name": "スイス5フラン銀貨", "price": 5978, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/12/swiss-5fr-omote-160x160.jpg", "rarity": "R"}, {"id": "i437", "name": "イタリア 500リラ銀貨", "price": 1973, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/12/Italy-500lira-omote-160x160.jpg", "rarity": "N"}, {"id": "i438", "name": "オランダ 2½グルデン銀貨 ユリアナ王女 (Nederland 2½ Gulden – Juliana)", "price": 2092, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4844-2-160x160.png", "rarity": "N"}, {"id": "i439", "name": "カナダ エリザベス2世 1ドル銀貨 カヌー (Canada Elizabeth II 1 Dollar)", "price": 4185, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4847-1-160x159.png", "rarity": "R"}, {"id": "i440", "name": "カナダ エリザベス2世 カナダ連邦100周年記念 1ドル銀貨（Canada Elizabeth II Confederation 100th Anniversary of Canada 1 dollar）", "price": 4185, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4849-1-160x158.png", "rarity": "R"}, {"id": "i441", "name": "カナダ 第21回オリンピック モントリオール大会 記念銀貨（Canada 1976 Summer Olympics Montréal Commemorative silver coin）", "price": 12594, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_1306-2-160x201.png", "rarity": "R"}, {"id": "i442", "name": "カナダ ブリティッシュコロンビア1ドル銀貨", "price": 4184, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2026/05/BritishColombia_1dollar_omote-160x160.webp", "rarity": "R"}, {"id": "i443", "name": "ドイツ 5マルク銀貨 アルブレヒト・デューラー生誕500周年 1971年（Germany 5 Deutsche Mark Albrecht Dürer 1971）", "price": 1339, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4853-1-160x160.png", "rarity": "N"}, {"id": "i444", "name": "ドイツ 5マルク銀貨（BUNDESREPUBLIK DEUTSCHLAND DEUTSCHE MARK 5）", "price": 1339, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4854-1-160x160.png", "rarity": "N"}, {"id": "i445", "name": "ドイツ 10マルク銀貨 ミュンヘンオリンピック1972年（10 Deutsche Mark Olympic Games in Munich 1972）", "price": 1853, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4856-1-160x158.png", "rarity": "N"}, {"id": "i446", "name": "スペイン 100ペセタ銀貨", "price": 3407, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2026/05/spain-100-Pesetas-160x160.webp", "rarity": "R"}, {"id": "i447", "name": "ベルギー 5フラン銀貨", "price": 5978, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2026/05/Belgium5franc_omote-160x160.webp", "rarity": "R"}, {"id": "i448", "name": "ロシア（旧ソ連）モスクワオリンピック10ルーブル銀貨（СССР. Игры XXII Олимпиады. Москва-1980. 10 рублей.）", "price": 7963, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/10/e4e765e41e0d5dcee43106da4579814e-160x160.png", "rarity": "R"}, {"id": "i449", "name": "ロシア（旧ソ連）モスクワオリンピック5ルーブル銀貨（СССР. Игры XXII Олимпиады. Москва-1980. 5 рублей.）", "price": 3985, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2022/03/moscow_5r-omo-160x160.png", "rarity": "R"}, {"id": "i450", "name": "バハマ プルーフ貨幣セット(Commonwealth of The Bahamas Proof Set)", "price": 23788, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_1153-1-160x160.jpg", "rarity": "SR"}, {"id": "i451", "name": "バルバドス プルーフ貨幣セット(First National Coinage Of Barbados Proof Set)", "price": 15571, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/IMG_1146-1-160x160.jpg", "rarity": "R"}, {"id": "i452", "name": "フィリピン 1ペソ銀貨 バターンデイ25周年1967年（Philippines 25th Anniversary of Bataan Day 1 Peso）", "price": 6217, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4868-1-160x161.png", "rarity": "R"}, {"id": "i453", "name": "ペルー1ソル銀貨", "price": 5978, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/12/Peru-1sol-ginka-omote-160x160.jpg", "rarity": "R"}, {"id": "i454", "name": "ペルー100ソル銀貨（Peru 100Soles）", "price": 4025, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/5-2-160x162.png", "rarity": "R"}, {"id": "i455", "name": "メキシコ銀貨", "price": 6473, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/12/mexico-bouekigin-omote-160x160.jpg", "rarity": "R"}, {"id": "i456", "name": "マカオ 5パタカ銀貨 伍圓 澳門（Macau 5 PATACAS）", "price": 2092, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4873-1-160x161.png", "rarity": "N"}, {"id": "i457", "name": "メキシコ 1ペソ銀貨 (ESTADOS UNIDOS MEXICANOS ·UN PESO)", "price": 100, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/batch_IMG_4870-1-160x160.png", "rarity": "N"}, {"id": "i458", "name": "メキシコ25ペソ銀貨（オリンピック）（Mexico 25Pesos Olymipics）", "price": 3136, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2021/08/7-2-160x160.png", "rarity": "R"}, {"id": "i459", "name": "アメリカ貿易銀", "price": 12000, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2022/06/US-trade-omo-160x160.png", "rarity": "R"}, {"id": "i460", "name": "イギリス貿易銀", "price": 9818, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2022/06/GB-trade-omo-160x160.png", "rarity": "R"}, {"id": "i461", "name": "フランス貿易銀（仏領インドシナ ピアストル銀貨）", "price": 6376, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/01/french-tradedollar-omote-160x160.webp", "rarity": "R"}, {"id": "i462", "name": "ブルガリア 5レヴァ銀貨", "price": 5978, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2026/05/Bulgaria-5leva-omote-160x160.webp", "rarity": "R"}, {"id": "i463", "name": "韓国 ソウルオリンピック記念銀貨", "price": 8709, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2025/07/15c7e8964aff650e0c38eba503fb9e62-160x160.jpg", "rarity": "R"}, {"id": "i464", "name": "朝鮮 半圜銀貨", "price": 10000, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/01/half-won-omo-160x160.webp", "rarity": "R"}, {"id": "i465", "name": "朝鮮 一両銀貨", "price": 4000, "type": "coin", "category": "外国銀貨", "img": "https://antylink.jp/wp-content/uploads/2024/01/korea-1yang-omo-160x160.webp", "rarity": "R"}, {"id": "i475", "name": "アメリカドル", "price": 90, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_doll-160x67.png", "rarity": "N"}, {"id": "i476", "name": "ユーロ", "price": 90, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_euro-160x83.png", "rarity": "N"}, {"id": "i477", "name": "カナダドル", "price": 50, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_canada-160x73.png", "rarity": "N"}, {"id": "i478", "name": "シンガポールドル", "price": 50, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_singapore-160x81.png", "rarity": "N"}, {"id": "i479", "name": "オーストラリアドル", "price": 40, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_australia-160x80.png", "rarity": "N"}, {"id": "i480", "name": "ドイツマルク", "price": 30, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_duits-160x81.png", "rarity": "N"}, {"id": "i481", "name": "中国人民元", "price": 12, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_china-160x78.png", "rarity": "N"}, {"id": "i482", "name": "香港ドル", "price": 11, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_honkon-160x80.png", "rarity": "N"}, {"id": "i483", "name": "韓国ウォン", "price": 5, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2021/10/bill_won-160x81.png", "rarity": "N"}, {"id": "i484", "name": "ニュー台湾ドル紙幣", "price": 2, "type": "note", "category": "外国の旧紙幣", "img": "https://antylink.jp/wp-content/uploads/2025/07/P_20250716_191823-1-1-160x80.jpg", "rarity": "N"}];

const RARITY = {
  MASTER: { en: "特級", color: "#C9A227", soft: "#FBF1D8", weight: 0.3, min: Infinity },
  LEGEND: { en: "LEGEND", color: "#E2123E", soft: "#FBE6E9", weight: 1,  min: 400000 },
  SSR:    { en: "SSR",    color: "#D9A521", soft: "#FAF1D8", weight: 4,  min: 100000 },
  SR:     { en: "SR",     color: "#7A4FD0", soft: "#EEE8F7", weight: 14, min: 20000 },
  R:      { en: "R",      color: "#2E84D4", soft: "#E4EEF7", weight: 31, min: 3000 },
  N:      { en: "N",      color: "#8C8C8C", soft: "#EEEEEE", weight: 50, min: 0 },
};
const TIER_ORDER = ["MASTER", "LEGEND", "SSR", "SR", "R", "N"];
const SRPLUS = ["MASTER", "LEGEND", "SSR", "SR"];
const ACCENT = { MASTER:"#FFD24D", LEGEND:"#FFC83D", SSR:"#F2C04B", SR:"#B06CFF", R:"#4FA8E8", N:"#BDBDBD" };
const PITY = 10;
const fmt = (n) => new Intl.NumberFormat("ja-JP").format(n);
const yen = (n) => "¥" + fmt(n);

const C = { ink:"#1C2433", gold:"#F3C969", txt:"#F4ECDA", sub:"#C7B8DC", mag:"#B06CFF", vermil:"#E2123E" };
const FONT_DISP = "'Shippori Mincho', serif";
const FONT_UI = "'Zen Maru Gothic', sans-serif";

// 共通の質感トークン（金属面・ガラス面・紫ドーム等）。全画面で再利用して統一感を出す。
const G = {
  goldRim: "linear-gradient(145deg,#FCEBB0 0%,#E7C766 22%,#B98C2E 52%,#7A5512 76%,#F4D88A 100%)",
  goldBar: "linear-gradient(180deg,#FFF6D2,#F3C969 42%,#C28F2C 78%,#8A6014)",
  glass:   "linear-gradient(165deg,rgba(255,255,255,.16),rgba(255,255,255,.05) 46%,rgba(255,255,255,.02))",
  panel:   "linear-gradient(168deg,rgba(70,46,112,.62),rgba(24,14,44,.72))",
  dome:    "radial-gradient(120% 110% at 38% 24%,#ECD6FF,#B06CFF 42%,#7A2FB0 72%,#4A1C7A 100%)",
};
// 和柄（青海波）を低不透明度で背景に敷くためのデータURI
const WAVE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='28' viewBox='0 0 56 28'><g fill='none' stroke='%23F3C969' stroke-opacity='0.06' stroke-width='1.4'><path d='M0 28a14 14 0 0 1 28 0a14 14 0 0 1 28 0'/><path d='M-14 28a14 14 0 0 1 28 0a14 14 0 0 1 28 0a14 14 0 0 1 28 0'/></g></svg>\")";

// コレクション・実績を端末に保存（localStorage）。使えない環境でも落ちないよう try/catch。
const SAVE_KEY = "kosen-gacha:v1";
function loadSave() {
  try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

const APPR = {
  MASTER: ["……ことばが出ません。本物の大判です。", "鑑定額、つけられません。", "これは、博物館級ですぞ……。"],
  LEGEND: ["こ、これは……正真正銘の本物！", "震えが止まりません……。", "大変なものが出ましたよ！"],
  SSR:    ["素晴らしい。状態も極上です。", "コレクター垂涎の一枚ですな。"],
  SR:     ["ほう、なかなかの掘り出し物。", "見どころのある一枚です。"],
  R:      ["うん、悪くない。価値ありますよ。", "味のある古銭ですな。"],
  N:      ["ふむ、これはこれで趣がある。", "歴史を感じる一枚ですな。", "賑やかしに、ひとつ。"],
};
const appraise = (tier) => { const a = APPR[tier] || APPR.N; return a[Math.floor(Math.random()*a.length)]; };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;background:#0b0716;overscroll-behavior:none}
:root{--app-h:100vh}
@supports (height:100dvh){:root{--app-h:100dvh}}
button:focus-visible{outline:3px solid #F3C969;outline-offset:2px;border-radius:8px}
@media (prefers-reduced-motion: reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
@keyframes cg-knob { from{transform:rotate(0)} to{transform:rotate(-360deg)} }
@keyframes cg-shake { 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(-2px,1px) rotate(-7deg)} 50%{transform:translate(2px,-1px) rotate(6deg)} 75%{transform:translate(-1px,2px) rotate(-4deg)} }
@keyframes cg-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes cg-pop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1)} }
@keyframes cg-up { 0%{transform:translateY(14px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes cg-sparkle { 0%,100%{transform:scale(.3);opacity:0} 50%{transform:scale(1);opacity:1} }
@keyframes cg-ring { 0%{transform:scale(.7);opacity:.9} 100%{transform:scale(1.8);opacity:0} }
@keyframes cg-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes cg-rays { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes cg-fall { from{transform:translateY(-8%) rotate(0)} to{transform:translateY(118vh) rotate(720deg)} }
@keyframes cg-flash { from{opacity:.92} to{opacity:0} }
@keyframes cg-pulse { 0%,100%{transform:scale(.9);opacity:.65} 50%{transform:scale(1.18);opacity:1} }
@keyframes cg-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes cg-glow { 0%,100%{box-shadow:0 0 22px #B06CFF77, inset 0 0 26px #ffffff33} 50%{box-shadow:0 0 46px #B06CFFdd, inset 0 0 32px #ffffff55} }
@keyframes cg-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes cg-marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.cg-knob-anim{animation:cg-knob .5s linear infinite;transform-origin:center}
.cg-pop{animation:cg-pop .5s cubic-bezier(.2,1.4,.4,1) both}
.cg-up{animation:cg-up .45s ease both}
.cg-btn{transition:transform .08s ease,filter .15s ease;-webkit-user-select:none;user-select:none}
.cg-btn:active:not(:disabled){transform:translateY(2px) scale(.99);filter:brightness(.97)}
.cg-btn:disabled{opacity:.5;cursor:not-allowed}
.cg-glow{animation:cg-glow 1.8s ease-in-out infinite}
.cg-item{transition:transform .12s ease}
.cg-item:active{transform:scale(.97)}
.cg-scroll::-webkit-scrollbar{height:0;width:0}
@keyframes cg-coin { 0%{transform:translateY(-12%) rotate(0);opacity:1} 100%{transform:translateY(122vh) rotate(540deg);opacity:.85} }
@keyframes cg-zoom { 0%{transform:scale(.2) rotate(-8deg);opacity:0} 55%{transform:scale(1.14) rotate(2deg);opacity:1} 75%{transform:scale(.97)} 100%{transform:scale(1) rotate(0)} }
@keyframes cg-stamp { 0%{transform:scale(2.6) rotate(-18deg);opacity:0} 55%{transform:scale(.84) rotate(5deg);opacity:1} 78%{transform:scale(1.08) rotate(-3deg)} 100%{transform:scale(1) rotate(-6deg)} }
@keyframes cg-quake { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-7px,4px)} 20%{transform:translate(6px,-5px)} 30%{transform:translate(-8px,-3px)} 40%{transform:translate(7px,5px)} 50%{transform:translate(-5px,6px)} 60%{transform:translate(6px,-4px)} 70%{transform:translate(-6px,3px)} 80%{transform:translate(4px,-6px)} 90%{transform:translate(-3px,4px)} }
@keyframes cg-vig { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes cg-throb { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.06);filter:brightness(1.3)} }
.cg-quake{animation:cg-quake .5s linear infinite}
.cg-zoom{animation:cg-zoom .6s cubic-bezier(.2,1.5,.4,1) both}
.cg-stamp{display:inline-block;animation:cg-stamp .55s cubic-bezier(.2,1.5,.3,1) both}
.cg-throb{animation:cg-throb .9s ease-in-out infinite}
@keyframes cg-flip { 0%{transform:perspective(320px) rotateY(90deg);opacity:0} 55%{opacity:1} 100%{transform:perspective(320px) rotateY(0);opacity:1} }
@keyframes cg-cutin { 0%{transform:translateX(-130%) skewX(-12deg);opacity:0} 55%{transform:translateX(3%) skewX(-12deg);opacity:1} 100%{transform:translateX(0) skewX(-12deg);opacity:1} }
@keyframes cg-lamp { 0%,100%{opacity:.25;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
@keyframes cg-zigzag { 0%,100%{opacity:0} 8%,28%{opacity:1} 36%{opacity:0} }
.cg-cv{content-visibility:auto;contain-intrinsic-size:auto 130px}
@keyframes cg-mfloat { 0%,100%{transform:translateY(0) rotate(-.5deg)} 50%{transform:translateY(-7px) rotate(.5deg)} }
@keyframes cg-cap { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.22) saturate(1.1)} }
@keyframes cg-sheen { 0%{transform:translateX(-160%) skewX(-18deg)} 58%,100%{transform:translateX(320%) skewX(-18deg)} }
@keyframes cg-ringspin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes cg-twinkle { 0%,100%{opacity:.15;transform:scale(.6)} 50%{opacity:1;transform:scale(1)} }
@keyframes cg-fadeup { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes cg-gaugemove { 0%{background-position:0 0} 100%{background-position:38px 0} }
@keyframes cg-rimflare { 0%,100%{opacity:.45;filter:blur(2px)} 50%{opacity:1;filter:blur(0)} }
.cg-mfloat{animation:cg-mfloat 4.4s ease-in-out infinite;transform-origin:center bottom}
.cg-cap-anim{animation:cg-cap .7s ease-in-out infinite}
.cg-fadeup{animation:cg-fadeup .7s cubic-bezier(.2,.9,.3,1) both}
.cg-sheen-wrap{position:relative;overflow:hidden}
.cg-sheen-wrap::after{content:"";position:absolute;top:0;bottom:0;left:0;width:42%;background:linear-gradient(90deg,transparent,#ffffff5e,transparent);transform:translateX(-160%) skewX(-18deg);animation:cg-sheen 5s ease-in-out infinite;pointer-events:none}
`;

function Fallback({ item, size }) {
  const r = RARITY[item.rarity];
  const note = item.type === "note";
  const label = (item.name || "").replace(/[（(].*$/, "").slice(0, 4);
  if (note) {
    return (
      <svg viewBox="0 0 150 92" width={size} height={(size*92)/150} style={{ display:"block" }}>
        <rect x="3" y="3" width="144" height="86" rx="6" fill={r.color} opacity="0.85" stroke={C.ink} strokeOpacity="0.3"/>
        <rect x="9" y="9" width="132" height="74" rx="4" fill="none" stroke="#fff" strokeOpacity="0.5"/>
        <text x="75" y="52" textAnchor="middle" fontFamily={FONT_DISP} fontWeight="700" fontSize="20" fill="#fff">{label}</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display:"block" }}>
      <circle cx="60" cy="60" r="52" fill={r.color} opacity="0.85" stroke={C.ink} strokeOpacity="0.3" strokeWidth="2"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke="#fff" strokeOpacity="0.45"/>
      <text x="60" y="61" textAnchor="middle" dominantBaseline="central" fontFamily={FONT_DISP} fontWeight="800" fontSize={label.length>2?24:34} fill="#fff">{label}</text>
    </svg>
  );
}
function Art({ item, size }) {
  const [err, setErr] = useState(false);
  if (err || !item.img) return <Fallback item={item} size={size} />;
  return <img src={item.img} alt={item.name} loading="lazy" decoding="async" onError={() => setErr(true)}
    style={{ maxWidth:size, maxHeight:size, width:"auto", height:"auto", objectFit:"contain", display:"block", borderRadius:4 }} />;
}
function RarityBadge({ tier, small }) {
  const r = RARITY[tier]; const master = tier === "MASTER";
  return <span style={{ fontFamily:FONT_UI, fontWeight:900, color: master?"#FFE08A":"#fff", background: master?"#15110A":r.color,
    border: master?"1px solid #C9A227":"none", borderRadius:999, padding: small?"1px 8px":"3px 14px", fontSize: small?11:14, letterSpacing:1, boxShadow:`0 1px 6px ${r.color}88` }}>{r.en}</span>;
}
function Sparkles({ color }) {
  const pts = [[10,16],[84,10],[90,72],[6,78],[50,2],[96,40],[28,92],[70,90]];
  return pts.map(([x,y],i)=>(
    <div key={i} style={{ position:"absolute", left:`${x}%`, top:`${y}%`, width:12, height:12, background:color,
      clipPath:"polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)",
      animation:`cg-sparkle 1.1s ease-in-out ${i*0.1}s infinite` }}/>
  ));
}
// 金の筆文字ブランドマーク（ヘッダー小／起動画面大で size を出し分け）
function Logo({ scale = 1 }) {
  const s = scale;
  return (
    <div style={{ display:"inline-flex", alignItems:"flex-end", gap:6*s, lineHeight:1, whiteSpace:"nowrap" }}>
      <span style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize:54*s, letterSpacing:1*s,
        background:G.goldBar, WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
        WebkitTextStroke:`${1.3*s}px #7A1020`, paintOrder:"stroke fill",
        filter:`drop-shadow(0 ${2*s}px ${3*s}px #000a) drop-shadow(0 0 ${9*s}px #F3C96955)` }}>古銭</span>
      <span style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:3*s, marginBottom:4*s }}>
        <span style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize:23*s, letterSpacing:1*s, color:"#fff",
          WebkitTextStroke:`${0.7*s}px #5a1530`, paintOrder:"stroke fill", textShadow:`0 ${1*s}px ${4*s}px #000b` }}>ガチャ</span>
        <span style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:8*s, color:"#fff", background:C.vermil,
          border:`${Math.max(1,1*s)}px solid #ffffff66`, borderRadius:4*s, padding:`${1*s}px ${5*s}px`, letterSpacing:1*s,
          boxShadow:`0 0 ${6*s}px ${C.vermil}aa` }}>KOSEN&nbsp;GACHA</span>
      </span>
    </div>
  );
}

// 光沢3Dカプセル販売機（カンプ準拠）。SVGの gradient/clip ID はサイズでユニーク化。
function Machine({ size = 184, rolling }) {
  const u = String(Math.round(size));
  const id = (k) => `m-${k}-${u}`;
  const caps = [
    [80,64,16,"#E2123E"],[112,53,17,"#D9A521"],[146,72,15,"#7A4FD0"],
    [66,100,15,"#2E84D4"],[104,95,18,"#B06CFF"],[143,108,14,"#3C6E47"],
    [86,132,14,"#F2F2F2"],[122,136,16,"#C9A227"],[150,140,12,"#E2123E"],
  ];
  const Cap = ([cx,cy,r,c],i) => (
    <g key={i}>
      <circle cx={cx} cy={cy} r={r} fill={c}/>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id("shade")})`}/>
      <rect x={cx-r} y={cy-1.1} width={r*2} height="2.2" fill="#ffffff" opacity=".3"/>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id("shine")})`}/>
      <circle cx={cx-r*0.34} cy={cy-r*0.4} r={r*0.2} fill="#fff" opacity=".9"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00000026"/>
    </g>
  );
  return (
    <svg viewBox="0 0 220 300" width={size} height={(size*300)/220} style={{ maxWidth:"100%", filter:"drop-shadow(0 18px 28px rgba(0,0,0,.48))" }}>
      <defs>
        <radialGradient id={id("shine")} cx="30%" cy="24%" r="62%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={id("shade")} cx="68%" cy="84%" r="72%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0.42"/>
        </radialGradient>
        <radialGradient id={id("glass")} cx="36%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.36"/>
          <stop offset="34%" stopColor="#d7ecf6" stopOpacity="0.05"/>
          <stop offset="78%" stopColor="#5a7c93" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#0b1622" stopOpacity="0.3"/>
        </radialGradient>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5066"/><stop offset="22%" stopColor="#E2123E"/>
          <stop offset="70%" stopColor="#B30E30"/><stop offset="100%" stopColor="#7C0A1F"/>
        </linearGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF0BE"/><stop offset="40%" stopColor="#F0C766"/>
          <stop offset="72%" stopColor="#B98C2E"/><stop offset="100%" stopColor="#7A5512"/>
        </linearGradient>
        <radialGradient id={id("knob")} cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFF8E2"/><stop offset="44%" stopColor="#F0CE7A"/>
          <stop offset="100%" stopColor="#9A6F1E"/>
        </radialGradient>
        <linearGradient id={id("dome")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6CBFF"/><stop offset="48%" stopColor="#B06CFF"/>
          <stop offset="100%" stopColor="#5E2599"/>
        </linearGradient>
        <clipPath id={id("globe")}><circle cx="110" cy="92" r="68"/></clipPath>
      </defs>

      {/* 接地影・台座 */}
      <ellipse cx="110" cy="292" rx="84" ry="9" fill="#000" opacity="0.28"/>
      <path d="M44 250 L176 250 L188 286 L32 286 Z" fill="#5C0715"/>
      <path d="M44 250 L176 250 L186 282 L34 282 Z" fill="none" stroke={`url(#${id("gold")})`} strokeWidth="3" opacity=".8"/>
      <rect x="40" y="284" width="20" height="8" rx="2" fill="#3a040d"/><rect x="160" y="284" width="20" height="8" rx="2" fill="#3a040d"/>

      {/* 筐体 */}
      <rect x="34" y="150" width="152" height="112" rx="18" fill={`url(#${id("body")})`} stroke={`url(#${id("gold")})`} strokeWidth="3"/>
      <rect x="46" y="162" width="13" height="88" rx="6.5" fill="#ffffff" opacity=".14"/>
      <rect x="40" y="156" width="140" height="14" rx="7" fill="#ffffff" opacity=".12"/>

      {/* 取り出し機構（ノブ） */}
      <circle cx="110" cy="200" r="30" fill={`url(#${id("gold")})`} stroke="#7A5512" strokeWidth="2"/>
      <circle cx="110" cy="200" r="22" fill="#260f04"/>
      <g style={{ transformOrigin:"110px 200px" }} className={rolling?"cg-knob-anim":""}>
        <circle cx="110" cy="200" r="18" fill={`url(#${id("knob")})`} stroke="#7A5512" strokeWidth="1.5"/>
        <rect x="106" y="183" width="8" height="34" rx="3" fill="#6e4f12"/>
        <rect x="93" y="196" width="34" height="8" rx="3" fill="#6e4f12"/>
        <circle cx="110" cy="200" r="5" fill={`url(#${id("gold")})`}/>
      </g>

      {/* COIN IN 投入口・千万両 木札 */}
      <g>
        <rect x="40" y="186" width="42" height="30" rx="6" fill="#2a1206" stroke="#7A5512" strokeWidth="1"/>
        <rect x="56" y="192" width="10" height="3" rx="1.5" fill="#F3C969"/>
        <text x="61" y="208" textAnchor="middle" fontFamily={FONT_UI} fontWeight="900" fontSize="7" fill="#F3C969" style={{ letterSpacing:1 }}>COIN</text>
      </g>
      <g>
        <rect x="138" y="184" width="42" height="34" rx="5" fill="#9A6A28" stroke="#5e3d12" strokeWidth="1.5"/>
        <rect x="142" y="188" width="34" height="26" rx="3" fill="none" stroke="#F3D89A" strokeWidth="1" opacity=".6"/>
        <text x="159" y="200" textAnchor="middle" fontFamily={FONT_DISP} fontWeight="800" fontSize="11" fill="#3a240a">千万</text>
        <text x="159" y="212" textAnchor="middle" fontFamily={FONT_DISP} fontWeight="800" fontSize="11" fill="#3a240a">両</text>
      </g>

      {/* 取り出しトレイ */}
      <rect x="74" y="234" width="72" height="16" rx="5" fill="#2a0a13"/>
      <rect x="80" y="238" width="60" height="9" rx="4" fill="#15040a"/>

      {/* ガラス球の金属リング台座（球と筐体の継ぎ目） */}
      <ellipse cx="110" cy="150" rx="74" ry="13" fill={`url(#${id("gold")})`} stroke="#7A5512" strokeWidth="1.5"/>
      <ellipse cx="110" cy="148" rx="68" ry="9" fill="#000" opacity=".22"/>

      {/* ガラス球 */}
      <circle cx="110" cy="92" r="70" fill="#eef5fa" opacity=".55"/>
      <g clipPath={`url(#${id("globe")})`}>
        <rect x="40" y="22" width="140" height="140" fill="#dfeef6" opacity=".35"/>
        <g className={rolling?"cg-cap-anim":""}>{caps.map(Cap)}</g>
      </g>
      <circle cx="110" cy="92" r="70" fill={`url(#${id("glass")})`}/>
      <ellipse cx="86" cy="54" rx="30" ry="15" fill="#ffffff" opacity=".5" transform="rotate(-26 86 54)"/>
      <circle cx="110" cy="92" r="70" fill="none" stroke={`url(#${id("gold")})`} strokeWidth="6"/>
      <circle cx="110" cy="92" r="65" fill="none" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5"/>
      {rolling && <circle cx="110" cy="92" r="74" fill="none" stroke="#FFE08A" strokeWidth="3" style={{ animation:"cg-rimflare .7s ease-in-out infinite" }}/>}

      {/* ドーム天面の KOSEN GACHA バナー＋フィニアル */}
      <rect x="106" y="8" width="8" height="14" rx="3" fill={`url(#${id("gold")})`}/>
      <circle cx="110" cy="9" r="6" fill={`url(#${id("gold")})`} stroke="#7A5512" strokeWidth="1"/>
      <rect x="33" y="20" width="154" height="27" rx="13.5" fill={`url(#${id("dome")})`} stroke={`url(#${id("gold")})`} strokeWidth="2"/>
      <rect x="40" y="24" width="140" height="8" rx="4" fill="#ffffff" opacity=".22"/>
      <text x="110" y="39" textAnchor="middle" fontFamily={FONT_DISP} fontWeight="800" fontSize="13" fill="#fff" style={{ letterSpacing:3 }}>KOSEN GACHA</text>
    </svg>
  );
}
// 光沢3Dの「回す！」ボタン（ホーム／起動で再利用）。背面に回転シマー環で高揚感を付与。
function RollButton({ size = 184, onClick, disabled, fx, title = "回す！", sub, note, noteColor }) {
  return (
    <button className="cg-btn cg-glow" disabled={disabled} onClick={onClick} aria-label={title}
      style={{ position:"relative", width:size, height:size, borderRadius:"50%", border:"none", padding:0, cursor:"pointer", background:"transparent", color:"#fff", fontFamily:FONT_DISP }}>
      {fx && <span aria-hidden style={{ position:"absolute", inset:-9, borderRadius:"50%", background:"conic-gradient(from 0deg,#F3C96900,#F3C969cc,#B06CFF99,#F3C96900,#FFE08Acc,#F3C96900)", filter:"blur(3px)", animation:"cg-ringspin 5.5s linear infinite", pointerEvents:"none" }}/>}
      <span aria-hidden style={{ position:"absolute", inset:0, borderRadius:"50%", background:G.goldRim, boxShadow:"0 7px 18px rgba(0,0,0,.45)" }}/>
      <span aria-hidden style={{ position:"absolute", inset:6, borderRadius:"50%", background:G.dome, boxShadow:"inset 0 -14px 26px rgba(0,0,0,.5), inset 0 12px 22px rgba(255,255,255,.34)" }}/>
      <span aria-hidden style={{ position:"absolute", top:"11%", left:"22%", right:"22%", height:"30%", borderRadius:"50%", background:"radial-gradient(120% 100% at 50% 0%, #ffffffcc, #ffffff00 70%)", pointerEvents:"none" }}/>
      <span style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%" }}>
        <span style={{ fontSize:Math.round(size*0.2), fontWeight:800, letterSpacing:4, textShadow:"0 2px 8px #0008, 0 0 14px #ffffff66" }}>{title}</span>
        {sub && <span style={{ fontFamily:FONT_UI, fontSize:Math.round(size*0.066), marginTop:4, color:"#FCE9A8" }}>{sub}</span>}
        {note && <span style={{ fontFamily:FONT_UI, fontSize:Math.round(size*0.056), marginTop:1, color:noteColor||"#ffffffbb" }}>{note}</span>}
      </span>
    </button>
  );
}
function Rays({ color }) {
  return (
    <div style={{ position:"absolute", left:"50%", top:"45%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}>
      <div style={{ width:820, height:820,
        background:`repeating-conic-gradient(${color}00 0deg, ${color}66 5deg, ${color}00 11deg)`,
        WebkitMaskImage:"radial-gradient(closest-side,#000 22%,transparent 70%)",
        maskImage:"radial-gradient(closest-side,#000 22%,transparent 70%)",
        animation:"cg-rays 11s linear infinite" }}/>
    </div>
  );
}
function Confetti({ rainbow }) {
  // Math.random() を render 中に呼ばないよう、初回マウント時に一度だけ生成する
  const [pieces] = useState(() => {
    const cols = rainbow ? ["#FFD24D","#FF5DA2","#5DE1FF","#7CFF8A","#E2123E","#D9A521"] : ["#FFD24D","#F2C04B","#FFE9A8","#D9A521"];
    const N = rainbow ? 46 : 26;
    return Array.from({length:N}).map((_,i)=>({ left:Math.random()*100, dur:2.0+Math.random()*1.8, delay:Math.random()*0.6, w:6+Math.random()*7, col:cols[i%cols.length] }));
  });
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {pieces.map((p,i)=>(
        <span key={i} style={{ position:"absolute", top:"-6%", left:p.left+"%", width:p.w, height:p.w*1.7, background:p.col, borderRadius:2, animation:`cg-fall ${p.dur}s linear ${p.delay}s infinite` }}/>
      ))}
    </div>
  );
}
function CoinRain() {
  const [coins] = useState(() => Array.from({length:28}).map(()=>({
    left: Math.random()*100, dur: 1.8+Math.random()*1.6, delay: Math.random()*0.7, size: 16+Math.random()*16,
  })));
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {coins.map((c,i)=>(
        <span key={i} style={{ position:"absolute", top:"-8%", left:c.left+"%", width:c.size, height:c.size, borderRadius:"50%",
          background:"radial-gradient(circle at 36% 30%, #FFF6CF, #F3C969 46%, #9c7616 100%)", border:"1px solid #7d5e10",
          boxShadow:"0 0 8px #F3C96999", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:c.size*0.62, fontWeight:900, color:"#7d5e10", animation:`cg-coin ${c.dur}s linear ${c.delay}s infinite` }}>¥</span>
      ))}
    </div>
  );
}
function CountUp({ to, dur, snd }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now(); const D = dur || 1200; let last = 0, n = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / D); const e = 1 - Math.pow(1 - p, 3); setV(Math.round(to * e));
      if (p < 1 && now - last > 55) { playTick(snd, n++); last = now; }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to, dur, snd]);
  return <>{yen(v)}</>;
}

function CeremonyCard({ item, comment, fx, snd, big }) {
  const accent = ACCENT[item.rarity];
  const master = item.rarity === "MASTER";
  const idx = TIER_ORDER.indexOf(item.rarity);
  const dur = item.price == null ? 0 : Math.min(2200, Math.max(800, 600 + Math.round(Math.log10(Math.max(10, item.price)) * 330)));
  const W = big ? 320 : 250;
  return (
    <div style={{ width:"100%", maxWidth:W, textAlign:"center", position:"relative" }}>
      <div style={{ marginBottom:8 }}><RarityBadge tier={item.rarity}/></div>
      <div className="cg-pop" style={{ position:"relative", margin:"0 auto", borderRadius:18, padding: big?"18px 14px":"12px 10px",
        background: master ? "radial-gradient(120% 120% at 50% 28%, #3a2a08, #140d03)" : "radial-gradient(120% 120% at 50% 28%, #2a2342, #140f24)",
        border:`2px solid ${accent}`, boxShadow:`0 0 34px ${accent}66, inset 0 0 30px #00000066` }}>
        {(master || item.rarity==="LEGEND" || item.rarity==="SSR") && <Sparkles color={accent}/>}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight: big?150:104 }}>
          <Art item={item} size={item.type==="note" ? (big?224:150) : (big?168:108)}/>
        </div>
      </div>
      <div className="cg-up" style={{ marginTop:12, fontFamily:FONT_DISP, fontWeight:700, fontSize: big?15:13, color:"#fff", textShadow:"0 1px 6px #000a", animationDelay:".15s" }}>
        「{comment}」<span style={{ fontSize:11, color:"#ffffff99", marginLeft:4 }}>― 鑑定士</span>
      </div>
      <div style={{ marginTop:10, fontFamily:FONT_DISP, fontWeight:800, fontSize: big?18:15, color:"#fff", lineHeight:1.25 }}>{item.name}</div>
      <div style={{ fontSize:11, color:"#ffffff99", marginTop:2 }}>{item.type==="coin"?"硬貨":"紙幣"} ・ {item.category}</div>
      <div style={{ marginTop:12, fontFamily:FONT_UI, fontSize:11, color:accent, letterSpacing:4 }}>鑑定額</div>
      <div className={idx<=2 ? "cg-throb" : undefined} style={{ fontFamily:FONT_UI, fontWeight:900, fontSize: big?40:30, color:accent, textShadow:`0 0 22px ${accent}88`, fontVariantNumeric:"tabular-nums", lineHeight:1.1 }}>
        {item.price == null
          ? <span style={{ fontSize: big?28:22 }}>応相談<span style={{ display:"block", fontSize:12, color:"#ffffffcc", marginTop:2, letterSpacing:2 }}>― プライスレス ―</span></span>
          : (fx ? <CountUp to={item.price} dur={dur} snd={snd}/> : yen(item.price))}
      </div>
    </div>
  );
}

// 10連の結果を1枚ずつ順番にめくる演出
function FlipGrid({ pull, fx, snd }) {
  useEffect(() => {
    if (!fx) return;
    const ids = pull.map((it,i)=> setTimeout(()=> playFlip(snd, it.rarity), 120 + i*150));
    return () => ids.forEach(clearTimeout);
  }, [pull, fx, snd]);
  return (
    <div onClick={(e)=>e.stopPropagation()} className="cg-scroll" style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, width:"100%", maxWidth:360 }}>
      {pull.map((it,i)=>(
        <div key={i} style={{ aspectRatio:"1/1", borderRadius:8, border:`2px solid ${RARITY[it.rarity].color}`, background:RARITY[it.rarity].soft, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:3, boxShadow: TIER_ORDER.indexOf(it.rarity)<=3 ? `0 0 10px ${RARITY[it.rarity].color}` : "none", animation: fx ? `cg-flip .5s ease ${120 + i*150}ms both` : "none" }}>
          <Art item={it} size={42}/>
        </div>
      ))}
    </div>
  );
}

function RevealOverlay({ phase, pull, comment, record, best, total, fx, snd, onSkip, onAgain, onClose }) {
  if (phase !== "rolling" && phase !== "reveal") return null;
  const bt = pull.length ? pull.map(i=>TIER_ORDER.indexOf(i.rarity)).reduce((a,b)=>Math.min(a,b)) : 5;
  const tier = TIER_ORDER[bt];
  const accent = ACCENT[tier];
  const hi = bt <= 2;            // SSR以上でフラッシュ＋紙吹雪＋コイン雨
  const rainbow = bt <= 1;       // 特級・LEGENDは虹
  const heroItem = pull.length ? pull.reduce((a,b)=> TIER_ORDER.indexOf(b.rarity) < TIER_ORDER.indexOf(a.rarity) ? b : a) : null;
  const single = pull.length === 1;
  const stampLabel = heroItem && heroItem.rarity==="MASTER" ? "特級" : heroItem && heroItem.rarity==="LEGEND" ? "LEGEND" : null;
  return (
    <div style={{ position:"fixed", top:0, bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:460, zIndex:50,
      background:"radial-gradient(120% 80% at 50% 40%, #1a0f2e 0%, #0b0716 80%)", overflow:"hidden" }}>
      {fx && rainbow && <div style={{ position:"absolute", inset:"-30%", background:"conic-gradient(from 0deg,#ff004c,#ff9a00,#faff00,#33ff5e,#00e5ff,#7a5cff,#ff00d4,#ff004c)", opacity:.16, animation:"cg-spin 9s linear infinite", pointerEvents:"none" }}/>}
      {fx && <Rays color={accent}/>}
      {fx && hi && <div style={{ position:"absolute", inset:0, boxShadow:`inset 0 0 120px 30px ${accent}99, inset 0 0 40px 6px ${accent}`, pointerEvents:"none", animation:"cg-vig 1.1s ease-in-out infinite", zIndex:2 }}/>}

      {phase === "rolling" && (() => {
        // パチンコ式の段階演出: 0=通常(青) 1=チャンス(緑) 2=激アツ(赤) 3=超激アツ(金虹)
        const stage = bt<=1 ? 3 : bt<=2 ? 2 : bt<=3 ? 1 : 0;
        const lampC = ["#4FA8E8","#7CFF8A","#FF3B5C","#FFD24D"][stage];
        const cutin = stage>=1 ? ["","リーチ！","激アツ！！","超・激・アツ！！！"][stage] : null;
        return (
        <div onClick={onSkip} style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:3, cursor:"pointer", overflow:"hidden" }}>
          {stage>=2 && ["8%","78%","20%","68%"].map((left,i)=>(
            <span key={i} style={{ position:"absolute", left, top:`${12+i*18}%`, fontSize:34, animation:`cg-zigzag 1.1s linear ${i*0.27}s infinite`, filter:`drop-shadow(0 0 8px ${lampC})`, pointerEvents:"none" }}>⚡</span>
          ))}
          <div style={{ textAlign:"center" }}>
            <div className={hi ? "cg-quake" : ""} style={{ position:"relative", width:170, height:190, margin:"0 auto" }}>
              {[0,0.4,0.8].map((d,i)=>(
                <div key={i} style={{ position:"absolute", top:20, left:10, right:10, bottom:20, borderRadius:"50%", border:`3px solid ${lampC}`, animation:`cg-ring 1.2s ease-out ${d}s infinite`, pointerEvents:"none" }}/>
              ))}
              <div style={{ position:"absolute", top:14, left:10, right:10, bottom:14, borderRadius:"50%", background:`radial-gradient(circle at 50% 42%, ${lampC}, ${lampC}00 70%)`, filter:"blur(8px)", animation:`cg-pulse ${stage>=2?0.55:1}s ease-in-out infinite` }}/>
              <svg viewBox="0 0 100 100" width="150" height="150" style={{ position:"relative", margin:"20px auto 0", display:"block", animation: hi?"cg-throb .5s ease-in-out infinite":"cg-bob 1.1s ease-in-out infinite" }}>
                <defs><clipPath id="cgcap2"><circle cx="50" cy="50" r="40"/></clipPath></defs>
                <circle cx="50" cy="50" r="40" fill="#f5f5f5"/>
                <rect x="10" y="10" width="80" height="40" fill={lampC} clipPath="url(#cgcap2)"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2"/>
                <ellipse cx="38" cy="34" rx="9" ry="6" fill="#ffffff88"/>
                <circle cx="50" cy="50" r="9" fill="#fff" stroke={lampC} strokeWidth="3"/>
              </svg>
            </div>
            <div style={{ marginTop:12, fontFamily:FONT_DISP, fontWeight:800, fontSize:22, color:"#fff", letterSpacing:5, textShadow:`0 0 18px ${lampC}`, animation: hi?"cg-blink .35s ease-in-out infinite":"none" }}>{stage===3 ? "な…なんと…！！" : hi ? "鑑定中……！？" : "鑑定中……"}</div>
            <div style={{ marginTop:10, display:"flex", justifyContent:"center", gap:10 }}>
              {[0,1,2,3].map(i=>(
                <span key={i} style={{ width:13, height:13, borderRadius:"50%", background: i<=stage ? lampC : "rgba(255,255,255,.15)", boxShadow: i<=stage ? `0 0 10px ${lampC}` : "none", animation: i<=stage ? `cg-lamp .8s ease-in-out ${i*0.15}s infinite` : "none" }}/>
              ))}
            </div>
            <div style={{ marginTop:12, fontFamily:FONT_UI, fontSize:11, color:"#ffffff88" }}>画面タップでスキップ</div>
          </div>
          {cutin && (
            <div style={{ position:"absolute", left:"-4%", right:"-4%", top:"56%", animation:"cg-cutin .4s cubic-bezier(.2,1.2,.4,1) .75s both", pointerEvents:"none" }}>
              <div style={{ background: stage===3 ? "linear-gradient(90deg,#ff004c,#ff9a00,#faff00,#33ff5e,#00e5ff,#7a5cff)" : `linear-gradient(90deg, ${lampC}dd, ${lampC}, ${lampC}dd)`, borderTop:"3px solid #fff", borderBottom:"3px solid #fff", padding:"10px 0", textAlign:"center", boxShadow:`0 0 40px ${lampC}` }}>
                <span style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize: stage===3?34:30, color:"#fff", letterSpacing:6, WebkitTextStroke:"1.5px #00000066", textShadow:"0 2px 0 #0008, 0 0 24px #fff" }}>{cutin}</span>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {phase === "reveal" && (
        <div style={{ position:"absolute", inset:0, overflowY:"auto" }}>
          {fx && hi && <div style={{ position:"absolute", inset:0, zIndex:5, pointerEvents:"none" }}><Confetti rainbow={rainbow}/><CoinRain/></div>}
          {fx && stampLabel && (
            <div style={{ position:"fixed", top:"26%", left:0, right:0, textAlign:"center", zIndex:6, pointerEvents:"none" }}>
              <span className="cg-stamp" style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize: stampLabel==="特級"?60:48, color:accent,
                WebkitTextStroke:`2px ${rainbow?"#ffffffcc":"#00000088"}`, textShadow:`0 0 30px ${accent}, 0 0 60px ${accent}` }}>{stampLabel}!!</span>
            </div>
          )}
          {fx && hi && <div style={{ position:"fixed", inset:0, background:"#fff", animation:"cg-flash .55s ease-out forwards", pointerEvents:"none", zIndex:8 }}/>}
          <div onClick={onClose} style={{ position:"relative", zIndex:3, minHeight:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"22px 14px" }}>
            {record && (
              <div className="cg-pop" style={{ marginBottom:10, fontFamily:FONT_DISP, fontWeight:800, fontSize:15, color:"#15110A", background:"linear-gradient(90deg,#FFE08A,#F3C969)", border:"1px solid #C9A227", borderRadius:999, padding:"5px 18px", boxShadow:"0 0 18px #F3C96988" }}>{heroItem && heroItem.rarity==="MASTER" ? "★ 特級 獲得！ ★" : "自己最高額 更新！"}</div>
            )}
            {pull.length > 1 && (
              <div style={{ marginBottom:8 }}><span style={{ fontFamily:FONT_UI, fontWeight:900, color:"#fff", fontSize:13, marginRight:8, letterSpacing:1 }}>最高レア</span><RarityBadge tier={tier}/></div>
            )}

            <div onClick={(e)=>e.stopPropagation()} className={fx ? "cg-zoom" : ""}><CeremonyCard item={heroItem} comment={comment} fx={fx} snd={snd} big={single}/></div>

            {pull.length > 1 && <FlipGrid pull={pull} fx={fx} snd={snd}/>}

            <div style={{ marginTop:16, display:"flex", gap:18, fontFamily:FONT_UI, fontSize:11, color:"#ffffffcc" }}>
              <span>自己最高額 <b style={{ color:C.gold, fontSize:13 }}>{yen(best)}</b></span>
              <span>累計鑑定額 <b style={{ color:C.gold, fontSize:13 }}>{yen(total)}</b></span>
            </div>

            <div onClick={(e)=>e.stopPropagation()} style={{ marginTop:16, display:"flex", gap:10, width:"100%", maxWidth:340 }}>
              <button className="cg-btn" onClick={()=>onAgain(pull.length)} style={{ flex:1, fontFamily:FONT_DISP, fontWeight:800, fontSize:18, color:"#fff", border:`2px solid ${C.gold}`, background:"radial-gradient(circle at 50% 30%, #C57BFF, #7A2FB0 70%)", padding:"13px 0", borderRadius:12, boxShadow:"0 4px 0 #4A1C7A", cursor:"pointer", letterSpacing:2 }}>もう一度{pull.length>1 ? `（${pull.length}連）` : ""}</button>
              <button className="cg-btn" onClick={onClose} style={{ flex:"0 0 96px", fontFamily:FONT_UI, fontWeight:800, fontSize:14, color:"#fff", border:"1px solid #ffffff55", background:"rgba(255,255,255,.08)", padding:"13px 0", borderRadius:12, cursor:"pointer" }}>閉じる</button>
            </div>
            <div style={{ marginTop:10, fontFamily:FONT_UI, fontSize:11, color:"#ffffff77" }}>背景タップでも閉じます</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── サウンド（Web Audio で合成。外部ファイル不要） ──────────────────
function ac() {
  try {
    const A = window.__cgAC || (window.__cgAC = new (window.AudioContext || window.webkitAudioContext)());
    if (A.state === "suspended") A.resume();
    return A;
  } catch { return null; }
}
function blip(A, { freq=440, type="triangle", t0=0, dur=0.18, gain=0.16, slideTo=null, pan=0 }, bag=null) {
  const t = A.currentTime + t0;
  const o = A.createOscillator(), g = A.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = g;
  if (pan && A.createStereoPanner) { const p = A.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; }
  o.connect(g); node.connect(A.destination);
  o.start(t); o.stop(t + dur + 0.02);
  if (bag) bag.push({ src:o, gain:g });
}
function noise(A, { t0=0, dur=0.2, gain=0.18, hp=800 }, bag=null) {
  const t = A.currentTime + t0;
  const n = Math.max(1, Math.floor(A.sampleRate * dur));
  const buf = A.createBuffer(1, n, A.sampleRate);
  const d = buf.getChannelData(0);
  for (let i=0;i<n;i++) d[i] = (Math.random()*2-1) * (1 - i/n);
  const src = A.createBufferSource(); src.buffer = buf;
  const f = A.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
  const g = A.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(A.destination); src.start(t); src.stop(t + dur);
  if (bag) bag.push({ src, gain:g });
}
// 回転中のドラムロール＋上昇スイープ（高レアほど激しく）
let rollVoices = [];
// スキップ時などに回転音を即座にフェードして止める
function stopRoll() {
  const A = window.__cgAC; const now = A ? A.currentTime : 0;
  rollVoices.forEach(({ src, gain }) => {
    try { gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04); } catch { /* noop */ }
    try { src.stop(now + 0.05); } catch { /* 既に停止済み */ }
  });
  rollVoices = [];
}
function playRoll(on, ms, hi) {
  if (!on) return; const A = ac(); if (!A) return;
  rollVoices = [];
  const dur = ms/1000;
  blip(A, { freq:180, type:"sawtooth", t0:0, dur:dur*0.96, gain:0.05, slideTo: hi?900:520 }, rollVoices);
  let t = 0, gap = 0.12;
  while (t < dur - 0.05) { noise(A, { t0:t, dur:0.05, gain:0.10, hp:1200 }, rollVoices); t += gap; gap = Math.max(0.035, gap*0.93); }
  if (hi) { blip(A, { freq:70, type:"sine", t0:dur*0.55, dur:0.18, gain:0.22 }, rollVoices); blip(A, { freq:70, type:"sine", t0:dur*0.78, dur:0.2, gain:0.26 }, rollVoices); }
  // カットイン（リーチ/激アツ）のホーン。SR以上（溜め1.7s以上）で表示タイミングに同期
  if (ms >= 1700) { blip(A, { freq:392, type:"sawtooth", t0:0.75, dur:0.45, gain:0.2, slideTo:784 }, rollVoices); blip(A, { freq:588, type:"square", t0:0.78, dur:0.4, gain:0.08, slideTo:1175 }, rollVoices); }
}
// 開封の一撃＋ファンファーレ（レア度でスケール）
function playReveal(tier, on) {
  if (!on) return; const A = ac(); if (!A) return;
  const idx = TIER_ORDER.indexOf(tier);
  blip(A, { freq:120, type:"sine", t0:0, dur:0.5, gain:0.34, slideTo:42 });
  noise(A, { t0:0, dur:0.35, gain: idx<=2 ? 0.3 : 0.16, hp:500 });
  const seq = tier==="MASTER" ? [523,659,784,1047,1319,1568,2093] :
              tier==="LEGEND" ? [523,659,784,1047,1319,1568] :
              tier==="SSR"    ? [523,659,784,1047,1319] :
              tier==="SR"     ? [523,659,784,1047] :
              tier==="R"      ? [523,659,784] : [440,554];
  let t = 0.12;
  seq.forEach((f,i)=>{ blip(A, { freq:f, type:"triangle", t0:t, dur:0.26, gain:0.18, pan:(i%2?0.4:-0.4) }); t += 0.092; });
  if (idx <= 2) {
    [1047,1319,1568,2093].forEach((f,i)=> blip(A, { freq:f, type:"sine", t0:t+0.05+i*0.03, dur:0.5, gain:0.08 }));
    blip(A, { freq:262, type:"triangle", t0:t+0.05, dur:0.7, gain:0.1 });
    blip(A, { freq:392, type:"triangle", t0:t+0.05, dur:0.7, gain:0.1 });
  }
}
// カウントアップ中のチクチク音（音程が上がる）
function playTick(on, i) {
  if (!on) return; const A = ac(); if (!A) return;
  blip(A, { freq: 880 + Math.min(36, i)*26, type:"square", t0:0, dur:0.04, gain:0.05 });
}
// コインのチャリン
function playCoin(on) {
  if (!on) return; const A = ac(); if (!A) return;
  blip(A, { freq:1760, type:"triangle", t0:0, dur:0.12, gain:0.12, slideTo:2637 });
  blip(A, { freq:2637, type:"sine", t0:0.04, dur:0.18, gain:0.08 });
}
// 触覚フィードバック（対応端末のみ）
function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch { /* vibrate 非対応 */ } }
// 10連めくり1枚ごとの軽い効果音（レアは明るく）
function playFlip(on, tier) {
  if (!on) return; const A = ac(); if (!A) return;
  const idx = TIER_ORDER.indexOf(tier);
  if (idx <= 3) { blip(A, { freq: idx<=1?1318:idx===2?1047:880, type:"triangle", t0:0, dur:0.16, gain:0.14 }); blip(A, { freq:1568, type:"sine", t0:0.02, dur:0.22, gain:0.06 }); }
  else blip(A, { freq:587, type:"square", t0:0, dur:0.05, gain:0.05 });
}

function BalanceCard({ label, value, color, icon, onAdd }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, background:G.glass, border:`1px solid ${color}77`, borderRadius:12, padding:"3px 4px 3px 6px", minWidth:120, backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", boxShadow:"inset 0 1px 0 #ffffff33, 0 2px 8px rgba(0,0,0,.3)" }}>
      <span style={{ width:20, height:20, flex:"0 0 20px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#3a2a00", background:`radial-gradient(circle at 35% 30%, #fff, ${color} 72%)`, boxShadow:`0 0 6px ${color}88` }}>{icon}</span>
      <div style={{ flex:1, lineHeight:1.05, minWidth:0 }}>
        <div style={{ fontSize:8, color:C.sub, whiteSpace:"nowrap" }}>{label}</div>
        <div style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:13, color:"#fff", fontVariantNumeric:"tabular-nums" }}>{fmt(value)}</div>
      </div>
      <button onClick={onAdd} aria-label={label+"を追加"} style={{ width:20, height:20, flex:"0 0 20px", borderRadius:"50%", border:"none", cursor:"pointer", background:"linear-gradient(135deg,#ff6fae,#e0488a)", color:"#fff", fontWeight:900, fontSize:14, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
    </div>
  );
}
function ToggleRow({ label, on, onToggle }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0" }}>
      <span style={{ fontSize:14, color:C.txt }}>{label}</span>
      <button onClick={onToggle} aria-label={label+"の切り替え"} style={{ width:54, height:28, borderRadius:999, border:"none", cursor:"pointer", position:"relative", background: on?"linear-gradient(90deg,#B06CFF,#F3C969)":"rgba(255,255,255,.18)" }}>
        <span style={{ position:"absolute", top:3, left: on?29:3, width:22, height:22, borderRadius:"50%", background:"#fff", transition:"left .15s ease", boxShadow:"0 1px 3px #0006" }}/>
      </button>
    </div>
  );
}

export default function App() {
  // 保存データを一度だけ読み込み、現行 ITEMS に存在する id だけ復元（収集数の不整合を防ぐ）
  const SAVED = useMemo(() => {
    const s = loadSave() || {};
    const valid = new Set(ITEMS.map(i => i.id));
    const counts = {};
    if (s.counts) for (const [id, n] of Object.entries(s.counts)) if (valid.has(id) && n > 0) counts[id] = n;
    const newIds = Array.isArray(s.newIds) ? s.newIds.filter(id => valid.has(id)) : [];
    return { counts, best: s.best || 0, total: s.total || 0, newIds };
  }, []);
  const [phase, setPhase] = useState("start");   // start | home | rolling | reveal
  const [tab, setTab] = useState("gacha");        // gacha | book
  const [pull, setPull] = useState([]);
  const [comment, setComment] = useState("");
  const [record, setRecord] = useState(false);
  const [counts, setCounts] = useState(() => SAVED.counts);
  const [coins, setCoins] = useState(5000);
  const [tickets, setTickets] = useState(10);
  const [pity, setPity] = useState(0);
  const [best, setBest] = useState(() => SAVED.best);
  const [total, setTotal] = useState(() => SAVED.total);
  const [log, setLog] = useState([]);
  const [fx, setFx] = useState(() => typeof window !== "undefined" && window.matchMedia ? !window.matchMedia("(prefers-reduced-motion: reduce)").matches : true);
  const [snd, setSnd] = useState(true);
  const [bookSort, setBookSort] = useState("rarity"); // rarity | price
  const [bookFilter, setBookFilter] = useState("all"); // all | owned | <tier>
  const [newIds, setNewIds] = useState(() => new Set(SAVED.newIds));
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef(null);
  const toastT = useRef(null);
  const finishRef = useRef(null);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  // コレクション・実績の変化を保存（newIds は配列化）
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v:1, counts, best, total, newIds:[...newIds] })); }
    catch { /* 保存不可環境は無視 */ }
  }, [counts, best, total, newIds]);

  const byTier = useMemo(() => { const m={MASTER:[],LEGEND:[],SSR:[],SR:[],R:[],N:[]}; ITEMS.forEach(it=>m[it.rarity].push(it)); return m; }, []);
  const rates = useMemo(() => { const av=TIER_ORDER.filter(t=>byTier[t].length); const tot=av.reduce((s,t)=>s+RARITY[t].weight,0); return av.map(t=>({t,pct:RARITY[t].weight/tot*100})); }, [byTier]);
  const sorted = useMemo(() => [...ITEMS].sort((a,b)=> TIER_ORDER.indexOf(a.rarity)-TIER_ORDER.indexOf(b.rarity) || (b.price||0)-(a.price||0)), []);
  const bookItems = useMemo(() => {
    let list = sorted;
    if (bookFilter === "owned") list = list.filter(it => counts[it.id]);
    else if (bookFilter !== "all") list = list.filter(it => it.rarity === bookFilter);
    if (bookSort === "price") list = [...list].sort((a,b)=> (b.price==null?Infinity:b.price) - (a.price==null?Infinity:a.price));
    return list;
  }, [sorted, bookFilter, bookSort, counts]);

  const draw = (allowed) => { const av=allowed.filter(t=>byTier[t]&&byTier[t].length); const tot=av.reduce((s,t)=>s+RARITY[t].weight,0); let r=Math.random()*tot, tier=av[av.length-1]; for(const t of av){ if(r<RARITY[t].weight){tier=t;break;} r-=RARITY[t].weight; } const pool=byTier[tier]; return pool[Math.floor(Math.random()*pool.length)]; };
  const drawOne = () => draw(TIER_ORDER);

  const showToast = (m) => { setToast(m); clearTimeout(toastT.current); toastT.current=setTimeout(()=>setToast(""),1600); };
  const busy = phase === "rolling" || phase === "reveal";
  const runFinish = () => { const f = finishRef.current; if (!f) return; finishRef.current = null; clearTimeout(timer.current); stopRoll(); f(); };
  const skipRoll = () => { if (phase === "rolling") runFinish(); };

  const doRoll = (n) => {
    const cost = n === 1 ? { t:1, c:300 } : { t:10, c:2700 };
    if (tickets >= cost.t) setTickets(x => x - cost.t);
    else if (coins >= cost.c) setCoins(x => x - cost.c);
    else { showToast("コイン・チケットが不足しています（＋でチャージ）"); return; }

    let p = pity; const res = [];
    if (n === 1) {
      p += 1; let it;
      if (p >= PITY) { it = draw(SRPLUS); p = 0; }
      else { it = drawOne(); if (SRPLUS.includes(it.rarity)) p = 0; }
      res.push(it);
    } else {
      for (let i=0;i<n;i++) res.push(drawOne());
      if (!res.some(x => SRPLUS.includes(x.rarity))) res[Math.floor(Math.random()*n)] = draw(SRPLUS);
      p = 0;
    }
    setPity(p);
    setPull(res);
    const bt = res.map(i=>TIER_ORDER.indexOf(i.rarity)).reduce((a,b)=>Math.min(a,b));
    const heroItem = res.reduce((a,b)=> TIER_ORDER.indexOf(b.rarity) < TIER_ORDER.indexOf(a.rarity) ? b : a);
    const batchBest = res.reduce((m,it)=> (it.price||0) > m ? (it.price||0) : m, 0);
    const masterHit = res.some(it=>it.rarity==="MASTER");
    const fresh = [...new Set(res.filter(it => !counts[it.id]).map(it => it.id))];

    const finish = () => {
      setCounts(prev => { const x={...prev}; res.forEach(it=>x[it.id]=(x[it.id]||0)+1); return x; });
      if (fresh.length) setNewIds(s => { const n = new Set(s); fresh.forEach(id => n.add(id)); return n; });
      setComment(appraise(TIER_ORDER[bt]));
      setRecord(masterHit || batchBest > best);
      setBest(v => Math.max(v, batchBest));
      setTotal(v => v + res.reduce((s,it)=>s+(it.price||0),0));
      if (TIER_ORDER.indexOf(heroItem.rarity) <= 3) setLog(L => [{ name:heroItem.name, price:heroItem.price, rarity:heroItem.rarity }, ...L].slice(0,8));
      setPhase("reveal"); playReveal(TIER_ORDER[bt], snd); if (fx && bt<=3) buzz(bt<=1?[70,40,90,40,120]:bt<=2?[50,30,70]:[35]);
    };
    finishRef.current = finish;
    if (fx) {
      setPhase("rolling");
      const suspense = bt<=1 ? 2800 : bt<=2 ? 2200 : bt<=3 ? 1700 : 1150;  // 高レアほど長くじらす（通常はテンポ良く）
      buzz(18); playRoll(snd, suspense, bt<=2);
      clearTimeout(timer.current); timer.current = setTimeout(runFinish, suspense);
    } else { finishRef.current = null; finish(); }
  };
  const roll = (n) => { if (!busy) doRoll(n); };
  const again = (n) => { setPull([]); setPhase("home"); doRoll(n); };
  const closeReveal = () => { setPull([]); setPhase("home"); };
  const resetAll = () => { try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ } setCounts({}); setBest(0); setTotal(0); setLog([]); setPity(0); setPull([]); setNewIds(new Set()); setPhase("home"); };

  const obtained = Object.keys(counts).length;
  const remain = PITY - pity;
  const canSingle = tickets >= 1 || coins >= 300;
  const canTen = tickets >= 10 || coins >= 2700;
  const d = new Date(now); const end = new Date(d); end.setHours(24,0,0,0);
  let s = Math.max(0, Math.floor((end - d)/1000));
  const hh = String(Math.floor(s/3600)).padStart(2,"0"); const mm = String(Math.floor((s%3600)/60)).padStart(2,"0"); const ss = String(s%60).padStart(2,"0");

  const shell = { width:"100%", maxWidth:460, minHeight:"var(--app-h)", margin:"0 auto", position:"relative",
    background:`${WAVE} repeat, radial-gradient(130% 72% at 50% -8%, #5b3793 0%, #34194f 44%, #150a26 100%)`,
    boxShadow:"0 0 50px rgba(0,0,0,.5), inset 0 0 130px rgba(0,0,0,.45)" };

  if (phase === "start") {
    const start = () => { setPhase("home"); setTab("gacha"); };
    return (
      <div style={{ minHeight:"var(--app-h)", background:"#0b0716", display:"flex", justifyContent:"center" }}>
        <style dangerouslySetInnerHTML={{ __html: css }}/>
        <div onClick={start} style={{ ...shell, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center",
          padding:"28px 22px calc(34px + env(safe-area-inset-bottom))", cursor:"pointer", overflow:"hidden" }}>
          <div aria-hidden style={{ position:"absolute", top:"32%", left:"50%", width:520, height:520, transform:"translate(-50%,-50%)", background:"radial-gradient(circle, #B06CFF44 0%, transparent 62%)", pointerEvents:"none" }}/>
          <div aria-hidden style={{ position:"absolute", top:"32%", left:"50%", width:560, height:560, transform:"translate(-50%,-50%)",
            background:"repeating-conic-gradient(#F3C9690a 0deg,#F3C96926 6deg,#F3C9690a 12deg)",
            WebkitMaskImage:"radial-gradient(closest-side,#000 30%,transparent 72%)", maskImage:"radial-gradient(closest-side,#000 30%,transparent 72%)",
            animation:"cg-rays 16s linear infinite", pointerEvents:"none" }}/>

          <div className="cg-fadeup" style={{ position:"relative", zIndex:1 }}><Logo scale={1.18}/></div>
          <div className="cg-fadeup" style={{ position:"relative", zIndex:1, marginTop:10, fontFamily:FONT_DISP, fontSize:14, letterSpacing:3, color:C.sub, animationDelay:".08s" }}>歴史を、コレクションに。</div>

          <div className={`cg-fadeup${fx?" cg-mfloat":""}`} style={{ position:"relative", zIndex:1, marginTop:14, animationDelay:".16s", filter:"drop-shadow(0 0 26px #B06CFF55)" }}>
            <Machine size={236}/>
          </div>

          <div className="cg-fadeup" style={{ position:"relative", zIndex:1, marginTop:20, width:"100%", maxWidth:300, animationDelay:".24s" }}>
            <button className="cg-btn cg-glow cg-sheen-wrap" onClick={(e)=>{ e.stopPropagation(); start(); }}
              style={{ width:"100%", fontFamily:FONT_DISP, fontWeight:800, fontSize:22, color:"#fff", border:"none", padding:"16px 0", borderRadius:999, cursor:"pointer", letterSpacing:8,
                background:G.dome, boxShadow:"0 6px 0 #4A1C7A, 0 12px 24px rgba(0,0,0,.45), inset 0 2px 0 #ffffff55, inset 0 0 0 2px #F3C96988" }}>はじめる</button>
            <div style={{ marginTop:12, fontSize:12, color:"#9a8fb0" }}>▶ 画面タップでもスタートできます</div>
          </div>
        </div>
      </div>
    );
  }

  const NAV_H = 64;

  return (
    <div style={{ minHeight:"var(--app-h)", background:"#0b0716", display:"flex", justifyContent:"center" }}>
      <style dangerouslySetInnerHTML={{ __html: css }}/>
      <div style={{ ...shell, paddingBottom: `calc(${NAV_H + 14}px + env(safe-area-inset-bottom))`, fontFamily:FONT_UI, color:C.txt }}>

        <div style={{ position:"sticky", top:0, zIndex:8, padding:"calc(8px + env(safe-area-inset-top)) 12px 8px", background:"rgba(16,8,30,.85)", backdropFilter:"blur(8px)", borderBottom:`1px solid ${C.gold}33` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <button onClick={() => setPhase("start")} aria-label="タイトルへ" style={{ background:"none", border:"none", textAlign:"left", cursor:"pointer", padding:0, flexShrink:0 }}>
              <Logo scale={0.42}/>
              <div style={{ fontSize:10, color:C.sub, marginTop:3 }}>歴史を、コレクションに。</div>
            </button>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <BalanceCard label="所持コイン" value={coins} color={C.gold} icon="¥" onAdd={() => { setCoins(c=>c+3000); playCoin(snd); buzz(8); showToast("コインを3,000チャージしました"); }}/>
              <BalanceCard label="所持チケット" value={tickets} color={C.mag} icon="🎟" onAdd={() => { setTickets(t=>t+10); playCoin(snd); buzz(8); showToast("チケットを10枚チャージしました"); }}/>
            </div>
          </div>
        </div>

        {tab === "gacha" && (
          <div style={{ padding:"12px 14px 6px" }}>
            {log.length > 0 && (
              <div className="cg-scroll" style={{ overflow:"hidden", borderRadius:999, background:"rgba(0,0,0,.25)", border:`1px solid ${C.gold}22`, padding:"5px 0", marginBottom:10 }}>
                <div style={{ display:"flex", whiteSpace:"nowrap", animation:"cg-marq 18s linear infinite", width:"max-content" }}>
                  {[...log, ...log].map((e,i)=>(
                    <span key={i} style={{ fontSize:11, color:"#fff", padding:"0 14px" }}>
                      <span style={{ color:ACCENT[e.rarity], fontWeight:900 }}>{RARITY[e.rarity].en}</span> {e.name} <b style={{ color:C.gold }}>{e.price==null?"応相談":yen(e.price)}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"30px minmax(0,1fr) 106px", gap:8, alignItems:"start", marginTop:2 }}>
              <div style={{ writingMode:"vertical-rl", fontFamily:FONT_DISP, fontWeight:800, fontSize:14, letterSpacing:4, color:"#fff", background:"linear-gradient(180deg,#7A2FB0,#4A1C7A)", border:`1px solid ${C.gold}66`, borderRadius:8, padding:"12px 4px", justifySelf:"start", textShadow:"0 1px 4px #0008", boxShadow:"0 4px 12px #0006" }}>価値ある一枚を、その手に！</div>
              <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", minWidth:0 }}>
                <div style={{ position:"absolute", left:-2, top:118, display:"flex", flexDirection:"column", gap:6, zIndex:2 }}>
                  <span style={{ fontSize:9, fontWeight:900, color:"#fff", background:"rgba(20,12,34,.92)", border:`1px solid ${RARITY.SSR.color}`, borderRadius:8, padding:"3px 6px", lineHeight:1.2, textAlign:"center", boxShadow:`0 0 8px ${RARITY.SSR.color}66` }}>初回限定<br/>SSR確定！</span>
                  <span style={{ fontSize:9, fontWeight:900, color:"#fff", background:"rgba(20,12,34,.92)", border:`1px solid ${RARITY.SR.color}`, borderRadius:8, padding:"3px 6px", lineHeight:1.2, textAlign:"center", boxShadow:`0 0 8px ${RARITY.SR.color}66` }}>10連で<br/>SR以上確定</span>
                </div>
                <div style={{ position:"absolute", top:44, width:202, height:202, borderRadius:"50%", background:"radial-gradient(circle, #B06CFF55 0%, transparent 64%)", pointerEvents:"none" }}/>
                <div className={fx?"cg-mfloat":undefined} style={{ position:"relative", zIndex:1 }}><Machine size={206} rolling={busy}/></div>
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ borderRadius:10, padding:"5px 8px", background:"radial-gradient(circle at 50% 0%, #3a2a08, #1c1405)", border:`1px solid ${C.gold}`, textAlign:"center", marginBottom:8 }}>
                  <div style={{ fontSize:9, color:C.gold, fontWeight:800, whiteSpace:"nowrap" }}>♛ 本日の大当たり</div>
                  <div style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:13, color:"#fff", fontVariantNumeric:"tabular-nums" }}>残り {hh}:{mm}:{ss}</div>
                </div>
                <div style={{ fontSize:10, color:C.sub, fontWeight:700, marginBottom:4, whiteSpace:"nowrap" }}>注目のレア古銭</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {["SSR","SR","R"].map(t => byTier[t].filter(i=>i.price!=null).sort((a,b)=>b.price-a.price)[0]).filter(Boolean).map(it=>{ const r=RARITY[it.rarity]; return (
                    <div key={it.id} style={{ background:"#fff", borderRadius:10, border:`2px solid ${r.color}`, padding:"4px 6px", boxShadow:`0 2px 8px ${r.color}44`, minWidth:0, overflow:"hidden" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
                        <RarityBadge tier={it.rarity} small/>
                        <div style={{ flex:"0 0 26px", height:26, display:"flex", alignItems:"center", justifyContent:"center" }}><Art item={it} size={it.type==="note"?40:24}/></div>
                      </div>
                      <div style={{ fontFamily:FONT_DISP, fontWeight:700, fontSize:9, color:C.ink, lineHeight:1.15, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{it.name}</div>
                      <div style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:10.5, color:r.color }}>{yen(it.price)}</div>
                    </div>
                  ); })}
                </div>
                <button onClick={()=>setTab("book")} style={{ marginTop:5, width:"100%", background:"none", border:"none", color:C.gold, fontSize:10.5, fontWeight:700, cursor:"pointer", textAlign:"right", whiteSpace:"nowrap" }}>一覧を見る →</button>
              </div>
            </div>

            <div style={{ width:"100%", marginTop:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.sub, marginBottom:4 }}>
                <span>SR以上 確定ゲージ</span><span style={{ color:C.gold, fontWeight:700 }}>あと {remain} 回</span>
              </div>
              <div style={{ height:9, background:"rgba(255,255,255,.12)", borderRadius:9, overflow:"hidden", border:`1px solid ${C.gold}33` }}>
                <div style={{ width:`${(pity/PITY)*100}%`, height:"100%", background:"linear-gradient(90deg,#7A4FD0,#B06CFF 52%,#F3C969)", boxShadow:"0 0 10px #F3C96988", transition:"width .3s ease" }}/>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:12 }}>
              <RollButton size={188} fx={fx} disabled={busy} onClick={() => roll(1)}
                sub="1回 ・ チケット×1"
                note={canSingle ? "または コイン300" : "残高不足 ・ ＋でチャージ"}
                noteColor={canSingle ? "#ffffffcc" : "#ffd2d2"} />
              <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:12 }}>
                <button className="cg-btn" disabled={busy} onClick={() => roll(10)} style={{ padding:"10px 20px", borderRadius:12, border:`2px solid ${C.gold}aa`, background:"rgba(0,0,0,.25)", color:C.gold, fontFamily:FONT_UI, fontWeight:900, fontSize:14, cursor:"pointer" }}>
                  10連を回す<span style={{ display:"block", fontSize:10, fontWeight:700, color: canTen?C.sub:"#ff9a9a", marginTop:1 }}>{canTen ? "SR以上1枚確定" : "残高不足"}</span>
                </button>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:11, color:C.sub }}>演出</span>
                  <button onClick={() => setFx(v=>!v)} aria-label="演出の切り替え" style={{ width:46, height:24, borderRadius:999, border:"none", cursor:"pointer", position:"relative", background: fx?"linear-gradient(90deg,#B06CFF,#F3C969)":"rgba(255,255,255,.18)" }}>
                    <span style={{ position:"absolute", top:3, left: fx?25:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .15s ease" }}/>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <div style={{ flex:1, borderRadius:14, padding:"10px 12px", background:"linear-gradient(135deg,#16357f,#2a63c4)", color:"#fff", border:"1px solid #ffffff33", boxShadow:"0 6px 18px rgba(0,0,0,.3)", overflow:"hidden", position:"relative" }}>
                <div style={{ position:"absolute", right:-10, top:-10, width:60, height:60, borderRadius:"50%", background:"#ffffff22" }}/>
                <div style={{ fontSize:10, color:"#FFD24D", fontWeight:800 }}>期間限定ピックアップ</div>
                <div style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize:15, lineHeight:1.2 }}>江戸時代の名品<br/>出現率UP！</div>
              </div>
              <button onClick={()=>setTab("book")} style={{ flex:"0 0 116px", textAlign:"left", cursor:"pointer", borderRadius:14, padding:"10px 12px", background:"rgba(255,255,255,.06)", border:"1px solid #ffffff1a", color:C.txt }}>
                <div style={{ fontSize:10, color:C.sub }}>コイン図鑑</div>
                <div style={{ fontSize:9, color:C.sub }}>コンプリート率</div>
                <div style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:22, color:C.gold, lineHeight:1.1 }}>{Math.round(obtained/ITEMS.length*100)}%</div>
                <div style={{ height:6, background:"rgba(255,255,255,.14)", borderRadius:6, overflow:"hidden", marginTop:3 }}><div style={{ width:`${obtained/ITEMS.length*100}%`, height:"100%", background:C.gold }}/></div>
              </button>
            </div>
          </div>
        )}

        {tab === "book" && (
          <div style={{ padding:"14px 14px 6px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8, borderBottom:`2px solid ${C.gold}33`, paddingBottom:6 }}>
              <span style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize:18, color:C.gold }}>図鑑</span>
              <span style={{ fontSize:13, color:C.sub }}>収集 {obtained} / {ITEMS.length}
                <button onClick={resetAll} style={{ marginLeft:12, fontSize:11, color:"#ff8fb0", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>リセット</button>
              </span>
            </div>
            <div className="cg-scroll" style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6 }}>
              {[["all","すべて"],["owned","入手済み"],...TIER_ORDER.map(t=>[t, RARITY[t].en])].map(([key,label])=>(
                <button key={key} onClick={()=>setBookFilter(key)} style={{ flex:"0 0 auto", fontFamily:FONT_UI, fontWeight:800, fontSize:11, padding:"5px 11px", borderRadius:999, cursor:"pointer", whiteSpace:"nowrap",
                  border:`1px solid ${bookFilter===key?C.gold:"#ffffff33"}`, background: bookFilter===key?"rgba(243,201,105,.18)":"rgba(255,255,255,.05)", color: bookFilter===key?C.gold:C.sub }}>{label}</button>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, margin:"4px 2px 10px" }}>
              <span style={{ fontSize:11, color:C.sub }}>並び替え</span>
              {[["rarity","レア度順"],["price","価格順"]].map(([key,label])=>(
                <button key={key} onClick={()=>setBookSort(key)} style={{ fontFamily:FONT_UI, fontWeight:700, fontSize:11, padding:"4px 10px", borderRadius:999, cursor:"pointer", border:"none",
                  background: bookSort===key?"linear-gradient(90deg,#B06CFF,#F3C969)":"rgba(255,255,255,.08)", color: bookSort===key?"#1a1030":C.sub }}>{label}</button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:11, color:C.sub }}>{bookItems.length}件</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:9 }}>
              {bookItems.map(it=>{
                const have = counts[it.id]||0; const r = RARITY[it.rarity]; const isNew = newIds.has(it.id);
                return (
                  <div key={it.id} className="cg-item cg-cv" style={{ position:"relative", borderRadius:12, padding:"10px 6px 8px", textAlign:"center", background: have?"#fff":"rgba(255,255,255,.06)", border:`2px solid ${have?r.color:"#ffffff22"}`, opacity: have?1:0.85, boxShadow: have && TIER_ORDER.indexOf(it.rarity)<=2 ? `0 0 12px ${r.color}66` : "none" }}>
                    {isNew && <span style={{ position:"absolute", top:4, left:6, fontSize:9, fontWeight:900, color:"#fff", background:"#E2123E", borderRadius:4, padding:"1px 5px", letterSpacing:.5, boxShadow:"0 0 8px #E2123E99" }}>NEW</span>}
                    {have>1 && <span style={{ position:"absolute", top:4, right:6, fontSize:11, fontWeight:900, color:"#fff", background:C.ink, borderRadius:999, padding:"0 7px" }}>×{have}</span>}
                    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:58 }}>
                      {have ? <Art item={it} size={it.type==="note"?86:54}/> :
                        <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,.14)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff8", fontFamily:FONT_DISP, fontSize:20 }}>?</div>}
                    </div>
                    <div style={{ marginTop:6, fontFamily:FONT_DISP, fontWeight:700, fontSize:10.5, lineHeight:1.2, minHeight:26, color: have?C.ink:C.sub }}>{have? it.name : "？？？"}</div>
                    <div style={{ marginTop:3, display:"flex", justifyContent:"center", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      <RarityBadge tier={it.rarity} small/>
                      {have ? <span style={{ fontSize:10.5, fontWeight:700, color:r.color }}>{it.price==null?"応相談":yen(it.price)}</span> : null}
                    </div>
                  </div>
                );
              })}
              {bookItems.length === 0 && <div style={{ gridColumn:"1 / -1", textAlign:"center", color:C.sub, fontSize:12, padding:"22px 0" }}>該当する古銭がありません</div>}
            </div>
            <div style={{ marginTop:16, fontSize:10.5, color:C.sub, textAlign:"center", lineHeight:1.7 }}>
              景品データ・画像: 古銭買取専門店アンティーリンク（antylink.jp/buyinglist）<br/>
              買取価格は2026-06-07時点のスナップショット（毎日変動）/ ローカル検証用
            </div>
          </div>
        )}

        {tab === "shop" && (
          <div style={{ padding:"16px 14px 6px" }}>
            <div style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize:18, color:C.gold }}>ショップ</div>
            <div style={{ fontSize:11, color:C.sub, margin:"2px 0 14px" }}>※ デモ用です（実際の決済はありません）</div>
            <div style={{ fontSize:12, color:C.gold, fontWeight:700, margin:"0 2px 8px" }}>コイン</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:18 }}>
              {[[3000,"お試し"],[10000,"おすすめ"],[30000,"お得"],[100000,"豪遊"]].map(([amt,tag])=>(
                <button key={amt} onClick={()=>{ setCoins(c=>c+amt); playCoin(snd); buzz(8); showToast(`コインを${fmt(amt)}チャージしました`); }} style={{ cursor:"pointer", borderRadius:14, padding:"12px", border:`1px solid ${C.gold}55`, background:G.panel, color:"#fff", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:C.gold }}>{tag}</div>
                  <div style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:20 }}>+{fmt(amt)}</div>
                  <div style={{ fontSize:10, color:C.sub }}>コイン</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize:12, color:C.mag, fontWeight:700, margin:"0 2px 8px" }}>チケット</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
              {[[10,"お試し"],[30,"おすすめ"],[50,"お得"],[100,"豪遊"]].map(([amt,tag])=>(
                <button key={amt} onClick={()=>{ setTickets(t=>t+amt); playCoin(snd); buzz(8); showToast(`チケットを${amt}枚チャージしました`); }} style={{ cursor:"pointer", borderRadius:14, padding:"12px", border:`1px solid ${C.mag}66`, background:G.panel, color:"#fff", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:C.mag }}>{tag}</div>
                  <div style={{ fontFamily:FONT_UI, fontWeight:900, fontSize:20 }}>+{amt}</div>
                  <div style={{ fontSize:10, color:C.sub }}>チケット</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div style={{ padding:"16px 14px 6px" }}>
            <div style={{ fontFamily:FONT_DISP, fontWeight:800, fontSize:18, color:C.gold, marginBottom:12 }}>設定</div>
            <div style={{ background:"rgba(255,255,255,.06)", borderRadius:14, padding:"4px 14px", border:"1px solid #ffffff1a" }}>
              <ToggleRow label="演出（アニメ・紙吹雪）" on={fx} onToggle={()=>setFx(v=>!v)}/>
              <div style={{ height:1, background:"#ffffff14" }}/>
              <ToggleRow label={`サウンド ${snd?"🔊":"🔇"}`} on={snd} onToggle={()=>{ const v=!snd; setSnd(v); if(v) playCoin(true); }}/>
            </div>

            <div style={{ marginTop:16, background:"rgba(255,255,255,.06)", borderRadius:14, padding:14, border:"1px solid #ffffff1a" }}>
              <div style={{ textAlign:"center", fontFamily:FONT_DISP, fontWeight:700, fontSize:15, marginBottom:10, color:C.txt }}>排出確率</div>
              {rates.map(({t,pct})=>(
                <div key={t} style={{ display:"flex", alignItems:"center", gap:10, margin:"7px 0" }}>
                  <RarityBadge tier={t} small/>
                  <div style={{ flex:1, height:8, background:"rgba(255,255,255,.14)", borderRadius:8, overflow:"hidden" }}><div style={{ width:`${Math.max(pct,0.6)}%`, height:"100%", background:RARITY[t].color }}/></div>
                  <span style={{ width:46, textAlign:"right", fontWeight:700, fontSize:12, color:ACCENT[t] }}>{pct<1?pct.toFixed(1):pct.toFixed(0)}%</span>
                </div>
              ))}
              <div style={{ fontSize:10.5, color:C.sub, textAlign:"center", marginTop:10 }}>特級＝大判（鑑定不能のロマン枠）/ 10連でSR以上1枚確定 / 単発も{PITY}回でSR以上確定</div>
            </div>

            <button onClick={resetAll} style={{ marginTop:16, width:"100%", padding:"12px", borderRadius:12, border:"1px solid #ff8fb055", background:"rgba(255,80,120,.08)", color:"#ff8fb0", fontFamily:FONT_UI, fontWeight:700, fontSize:13, cursor:"pointer" }}>データをリセット</button>

            <div style={{ marginTop:16, fontSize:10.5, color:C.sub, textAlign:"center", lineHeight:1.7 }}>
              景品データ・画像: 古銭買取専門店アンティーリンク（antylink.jp/buyinglist）<br/>
              買取価格は2026-06-07時点のスナップショット（毎日変動）/ ローカル検証用
            </div>
          </div>
        )}

        {toast && (
          <div style={{ position:"fixed", bottom:`calc(${NAV_H+18}px + env(safe-area-inset-bottom))`, left:"50%", transform:"translateX(-50%)", zIndex:40, background:"rgba(20,12,34,.95)", color:"#fff", border:`1px solid ${C.gold}66`, borderRadius:999, padding:"9px 18px", fontSize:12, fontWeight:700, boxShadow:"0 6px 20px rgba(0,0,0,.4)", maxWidth:"90%", textAlign:"center" }}>{toast}</div>
        )}

        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:460, height:`calc(${NAV_H}px + env(safe-area-inset-bottom))`, paddingBottom:"env(safe-area-inset-bottom)",
          background:"rgba(16,8,30,.96)", borderTop:`1px solid ${C.gold}44`, display:"flex", boxShadow:"0 -2px 16px rgba(0,0,0,.4)", zIndex:9 }}>
          {[["gacha","ホーム","🏠"],["book","コレクション","🗂️"],["shop","ショップ","🛍️"],["settings","設定","⚙️"]].map(([k,label,icon])=>(
            <button key={k} onClick={() => { if (k !== "book" && tab === "book" && newIds.size) setNewIds(new Set()); setTab(k); }} style={{ flex:1, position:"relative", background: tab===k?"linear-gradient(180deg,rgba(255,122,176,.18),transparent)":"none", border:"none", cursor:"pointer",
              color: tab===k?"#ff7ab0":"#8a7fa6", fontFamily:FONT_UI, fontWeight: tab===k?900:600, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
              {tab===k && <span aria-hidden style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:28, height:3, borderRadius:3, background:"#ff7ab0", boxShadow:"0 0 8px #ff7ab0" }}/>}
              <span style={{ fontSize:18, lineHeight:1, position:"relative" }}>{icon}
                {k==="book" && newIds.size>0 && <span style={{ position:"absolute", top:-6, right:-13, minWidth:15, height:15, padding:"0 4px", borderRadius:999, background:"#E2123E", color:"#fff", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 8px #E2123E" }}>{newIds.size>99?"99+":newIds.size}</span>}
              </span>
              <span style={{ fontSize:10 }}>{label}</span>
            </button>
          ))}
        </div>

        <RevealOverlay phase={phase} pull={pull} comment={comment} record={record} best={best} total={total} fx={fx} snd={snd} onSkip={skipRoll} onAgain={again} onClose={closeReveal}/>
      </div>
    </div>
  );
}
