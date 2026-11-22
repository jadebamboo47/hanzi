// ================================================================ Lernpfad (Duolingo-Stil)
// Baut aus den importierten Buchpaketen kurze Lerneinheiten (ca. 10 Min.): eine Übung pro Bildschirm,
// Fehler kommen am Ende nochmal, XP, Tagesziel, Serie. Videos werden nur von YouTube eingebettet.
const LPKEY='hanzi-path-v1';
let LS={done:{},mist:[],xp:{},unit:null,vid:{}};
try{ Object.assign(LS,JSON.parse(localStorage.getItem(LPKEY)||'{}')); }catch(e){}
function saveL(){ try{ localStorage.setItem(LPKEY,JSON.stringify(LS)); }catch(e){} }
const XPGOAL=30;
function dk(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function xpToday(){ return LS.xp[dk()]||0; }
function addXP(n){ LS.xp[dk()]=xpToday()+n; const ks=Object.keys(LS.xp); if(ks.length>60) delete LS.xp[ks[0]]; saveL(); try{ HZ.addXP&&HZ.addXP(n); }catch(e){} }
function streakN(){ try{ return HZ.streak?HZ.streak():0; }catch(e){ return 0; } }

const VIDEOS={
 'ce1-e0':[
  {id:'389SpfseXNs',title:'Zählen mit einer Hand – so macht man es in China',src:'YouTube · Xiao Li',lvl:'A1',
   ph:[['一','yī','eins'],['二','èr','zwei'],['三','sān','drei'],['六','liù','sechs'],['八','bā','acht'],['十','shí','zehn']]},
  {id:'kVCdlGXFM9g',title:'Zahlen 1–10 und wie Chinesen mit der Hand zählen',src:'YouTube · Xiao He',lvl:'A1',ph:[]}],
 'ce1-e1':[
  {id:'MNNIrDJyYto',title:'Wie Studierende an der Peking-Uni ihren chinesischen Namen finden',src:'YouTube · Peking University',lvl:'A2',
   ph:[['你叫什么名字？','Nǐ jiào shénme míngzi?','Wie heißt du?'],['我叫马克。','Wǒ jiào Mǎkè.','Ich heiße Mark.'],['我姓王。','Wǒ xìng Wáng.','Mein Familienname ist Wang.'],['中文名字','Zhōngwén míngzi','chinesischer Name']]},
  {id:'B1cT1anrl_E',start:64,end:103,title:'Die häufigsten chinesischen Familiennamen',src:'YouTube · Erklärvideo',lvl:'A1',ph:[]}],
 'ce1-e2':[
  {id:'1W7HgwPYhp4',title:'Straßeninterview: Was ist deine Lieblingsstadt in China?',src:'YouTube · Easy Mandarin',lvl:'A2–B1',
   ph:[['你是哪国人？','Nǐ shì nǎ guó rén?','Aus welchem Land kommst du?'],['我是德国人。','Wǒ shì Déguó rén.','Ich bin Deutscher.'],['北京','Běijīng','Peking'],['上海','Shànghǎi','Schanghai']]},
  {id:'xyCqfa8ZZ6Q',title:'„你是哪儿人？“ – Woher kommst du?',src:'YouTube · Anfängerkurs',lvl:'A1',ph:[]}],
 'ce1-e3':[
  {id:'UfsY7R3G5UI',start:148,end:261,title:'Straßeninterview: Was machst du beruflich?',src:'YouTube · Rita Mandarin Chinese',lvl:'A2–B1',
   ph:[['目前有两家店。','Mùqián yǒu liǎng jiā diàn.','Zurzeit habe ich zwei Läden.'],['已经做了快八年了。','Yǐjīng zuò le kuài bā nián le.','Das mache ich schon fast acht Jahre.'],['我自己有一些养乌龟的小生意。','Wǒ zìjǐ yǒu yìxiē yǎng wūguī de xiǎo shēngyi.','Ich habe ein kleines Geschäft mit Schildkröten.']]},
  {id:'FBI_AcFxn2g',title:'Straßeninterview: Was arbeitest du? (ohne Untertitel)',src:'YouTube · Easy Mandarin',lvl:'A2–B1',ph:[]}],
 'ce1-e4':[
  {id:'c1Pz6H6YLQQ',start:201,title:'Straßeninterview: Alter, Größe, Lieblingsfarbe',src:'YouTube · Better in Chinese',lvl:'A2',
   ph:[['你今年多大？','Nǐ jīnnián duō dà?','Wie alt bist du dieses Jahr?'],['你有多高？','Nǐ yǒu duō gāo?','Wie groß bist du?'],['好高啊！','Hǎo gāo a!','So groß!'],['你最喜欢的颜色是什么？','Nǐ zuì xǐhuan de yánsè shì shénme?','Was ist deine Lieblingsfarbe?'],['你最喜欢的水果是什么？','Nǐ zuì xǐhuan de shuǐguǒ shì shénme?','Was ist dein Lieblingsobst?'],['你是独生子女还是有兄弟姐妹？','Nǐ shì dúshēng zǐnǚ háishi yǒu xiōngdì jiěmèi?','Bist du Einzelkind oder hast du Geschwister?']]},
  {id:'uGI1AfPq6eg',start:390,title:'„我的个子高“ – Aussehen beschreiben',src:'YouTube · Jin Tan',lvl:'A1',
   ph:[['我的个子高。','Wǒ de gèzi gāo.','Ich bin groß.'],['它的个子矮。','Tā de gèzi ǎi.','Es ist klein.']]}],
 'ce1-e5':[
  {id:'ACF5A4vn2gs',start:0,end:58,title:'Sieben Fragen zur Person: Adresse, Telefon, E-Mail',src:'YouTube · Mandarin HQ',lvl:'A1',
   ph:[['你住在哪里？','Nǐ zhù zài nǎlǐ?','Wo wohnst du?'],['我的电话号码是……','Wǒ de diànhuà hàomǎ shì …','Meine Telefonnummer ist …'],['你的邮箱是什么？','Nǐ de yóuxiāng shì shénme?','Wie ist deine E-Mail-Adresse?'],['你的生日是几月几号？','Nǐ de shēngrì shì jǐ yuè jǐ hào?','Wann hast du Geburtstag?']]},
  {id:'zADqVpS1G4E',title:'Telefonnummern erfragen und vorlesen',src:'YouTube · Everyday Chinese',lvl:'A1',ph:[]}],
 'ce1-e6':[
  {id:'pmaguhYVKzQ',title:'„你的生日是几月几号？“ – über den Geburtstag sprechen',src:'YouTube · SherryChinese',lvl:'A1–A2',
   ph:[['你的生日是几月几号？','Nǐ de shēngrì shì jǐ yuè jǐ hào?','Wann hast du Geburtstag?'],['你的生日，你喜欢做什么？','Nǐ de shēngrì, nǐ xǐhuan zuò shénme?','Was machst du gern an deinem Geburtstag?'],['开派对','kāi pàiduì','eine Party feiern'],['吃蛋糕','chī dàngāo','Kuchen essen'],['和家人吃饭','hé jiārén chīfàn','mit der Familie essen']]},
  {id:'Cc4M2L5a-OU',start:55,title:'Jahr, Monat, Tag und Woche ausdrücken',src:'YouTube · Everyday Chinese',lvl:'A1',
   ph:[['今天是几月几号？','Jīntiān shì jǐ yuè jǐ hào?','Welches Datum ist heute?'],['今天星期几？','Jīntiān xīngqī jǐ?','Welcher Wochentag ist heute?']]}],
 'ce1-e7':[
  {id:'c1Pz6H6YLQQ',start:242,end:268,title:'Straßeninterview: Wann stehst du auf, wann hast du Feierabend?',src:'YouTube · Better in Chinese',lvl:'A2',
   ph:[['你每天什么时候要起床上班？','Nǐ měi tiān shénme shíhou yào qǐchuáng shàngbān?','Wann musst du jeden Tag für die Arbeit aufstehen?'],['九点多会起床。','Jiǔ diǎn duō huì qǐchuáng.','Kurz nach neun stehe ich auf.'],['下班是六点。','Xiàbān shì liù diǎn.','Feierabend ist um sechs.'],['你每天几点睡觉？','Nǐ měi tiān jǐ diǎn shuìjiào?','Um wie viel Uhr gehst du jeden Tag schlafen?'],['大概十二点左右。',"Dàgài shí'èr diǎn zuǒyòu.",'Ungefähr um zwölf.']]},
  {id:'cTAW2-4n50g',start:70,title:'„我的一天“ – ein Tagesablauf in drei Tempi',src:'YouTube · Yang Mandarin Chinese',lvl:'A1',
   ph:[['早上七点，我起床。','Zǎoshang qī diǎn, wǒ qǐchuáng.','Um sieben Uhr morgens stehe ich auf.'],['七点半，我做早餐。','Qī diǎn bàn, wǒ zuò zǎocān.','Um halb acht mache ich Frühstück.'],['八点，我坐地铁去上班。','Bā diǎn, wǒ zuò dìtiě qù shàngbān.','Um acht fahre ich mit der U-Bahn zur Arbeit.'],['中午十二点，我吃午饭。',"Zhōngwǔ shí'èr diǎn, wǒ chī wǔfàn.",'Um zwölf Uhr mittags esse ich zu Mittag.']]}],
 'ce1-e8':[
  {id:'GgXaTa4k_QU',start:78,end:226,title:'Im Supermarkt in China: Was kostet das?',src:'YouTube · Zhangkai Chinese',lvl:'A2',
   ph:[['西瓜多少钱？','Xīguā duōshao qián?','Was kostet die Wassermelone?'],['十块钱一个。','Shí kuài qián yí ge.','Zehn Kuai das Stück.'],['三块九毛九一斤。','Sān kuài jiǔ máo jiǔ yì jīn.','3,99 Kuai pro Pfund.'],['这个很便宜。','Zhège hěn piányi.','Das ist sehr günstig.']]},
  {id:'fmo1wjjkTLc',title:'„水果多少钱？“ – Obst kaufen und Preise sagen',src:'YouTube · Lizzie Liu',lvl:'A1',
   ph:[['你去超市买了什么水果？','Nǐ qù chāoshì mǎi le shénme shuǐguǒ?','Welches Obst hast du im Supermarkt gekauft?'],['我买了一点儿苹果、橘子和蓝莓。','Wǒ mǎi le yìdiǎnr píngguǒ, júzi hé lánméi.','Ich habe ein paar Äpfel, Mandarinen und Blaubeeren gekauft.']]}],
 'ce1-e9':[
  {id:'SYjtd6uorsg',title:'Auf der Nanjing Road in Schanghai nach dem Weg fragen',src:'YouTube · Michael Delivers',lvl:'A2',
   ph:[['你好，请问超市怎么走？','Nǐ hǎo, qǐngwèn chāoshì zěnme zǒu?','Hallo, entschuldigen Sie, wie komme ich zum Supermarkt?']]},
  {id:'sp4OZvjq_pI',title:'Nach dem Weg fragen und den Weg beschreiben',src:'YouTube · Sisi Laoshi',lvl:'A1–A2',
   ph:[['往前走','wǎng qián zǒu','geradeaus gehen'],['往左走','wǎng zuǒ zǒu','nach links gehen'],['往右走','wǎng yòu zǒu','nach rechts gehen'],['路口','lùkǒu','Kreuzung']]}],
 'ce1-e10':[
  {id:'iJyJ7MLSOEY',title:'Am Bahnhof in Guangzhou: mit dem Zug nach Shenzhen',src:'YouTube · Sensoba Chinese',lvl:'A2',
   ph:[['我今天要搭火车去深圳。','Wǒ jīntiān yào dā huǒchē qù Shēnzhèn.','Ich fahre heute mit dem Zug nach Shenzhen.'],['我现在在火车站。','Wǒ xiànzài zài huǒchēzhàn.','Ich bin jetzt am Bahnhof.'],['这里是检票口。','Zhèlǐ shì jiǎnpiàokǒu.','Hier ist die Ticketkontrolle.'],['火车停在站台。','Huǒchē tíng zài zhàntái.','Der Zug hält am Bahnsteig.'],['我现在上火车。','Wǒ xiànzài shàng huǒchē.','Ich steige jetzt in den Zug.']]},
  {id:'wb_wSf9b770',title:'Am Schalter: eine Fahrkarte nach Peking kaufen (langsam gesprochen)',src:'YouTube · Slow Chinese',lvl:'A2–B1',
   ph:[['去北京的火车还有吗？','Qù Běijīng de huǒchē hái yǒu ma?','Gibt es noch Züge nach Peking?'],['这班几点到北京呢？','Zhè bān jǐ diǎn dào Běijīng ne?','Wann kommt dieser Zug in Peking an?'],['帮我订一张一等座。','Bāng wǒ dìng yì zhāng yīděngzuò.','Buchen Sie mir bitte einen Platz in der ersten Klasse.']]}],
 'ce1-e11':[
  {id:'e_6DNIkCS3A',title:'Straßeninterview: Kannst du gut singen?',src:'YouTube · Easy Mandarin',lvl:'A2',
   ph:[['你很会唱歌吗？','Nǐ hěn huì chànggē ma?','Kannst du gut singen?'],['不会唱，嗓子不好。','Bú huì chàng, sǎngzi bù hǎo.','Ich kann nicht singen, meine Stimme ist nicht gut.'],['不怎么会，儿歌还可以。','Bù zěnme huì, érgē hái kěyǐ.','Nicht besonders, Kinderlieder gehen noch.']]},
  {id:'UfsY7R3G5UI',start:261,end:440,title:'Straßeninterview: Was machst du gern?',src:'YouTube · Rita Mandarin Chinese',lvl:'A2–B1',
   ph:[['我还喜欢做各种的室外运动。','Wǒ hái xǐhuan zuò gèzhǒng de shìwài yùndòng.','Ich mache auch gern alle möglichen Outdoor-Sportarten.'],['平常喜欢参加社区的活动。','Píngcháng xǐhuan cānjiā shèqū de huódòng.','Normalerweise nehme ich gern an Aktivitäten der Gemeinde teil.'],['还有做点瑜伽。','Hái yǒu zuò diǎn yújiā.','Und ein bisschen Yoga.']]}],
 'ce1-e12':[
  {id:'udNgkHIiQVA',title:'Straßeninterview: Was hast du zum Frühlingsfest vor?',src:'YouTube · Easy Mandarin',lvl:'A2',
   ph:[['春节，你打算做些什么？','Chūnjié, nǐ dǎsuàn zuò xiē shénme?','Was hast du zum Frühlingsfest vor?'],['吃饺子','chī jiǎozi','Jiaozi essen'],['放鞭炮','fàng biānpào','Böller zünden'],['陪父母','péi fùmǔ','Zeit mit den Eltern verbringen'],['看春晚','kàn Chūnwǎn','die Frühlingsfest-Gala schauen']]},
  {id:'RRTgsLZiClk',title:'Hello China: die Pekingoper kurz vorgestellt',src:'YouTube · Hello China',lvl:'A1',ph:[]}],
 'ce2-e1':[
  {id:'QjZfQfhyESE',start:30,end:200,title:'Ein Samstag in Shenzhen',src:'YouTube · Chinese with Nicole',lvl:'A2',
   ph:[['因为今天是星期六，不用工作。','Yīnwèi jīntiān shì xīngqīliù, búyòng gōngzuò.','Weil heute Samstag ist, muss ich nicht arbeiten.'],['我喜欢一边化妆一边看一些视频。','Wǒ xǐhuan yìbiān huàzhuāng yìbiān kàn yìxiē shìpín.','Ich schaue gern Videos, während ich mich schminke.'],['现在快下午四点钟了。','Xiànzài kuài xiàwǔ sì diǎn zhōng le.','Es ist jetzt fast vier Uhr nachmittags.'],['今天外面的天气不太好。','Jīntiān wàimiàn de tiānqì bú tài hǎo.','Das Wetter draußen ist heute nicht so gut.']]},
  {id:'rvRpgGZ0fk4',start:228,end:382,title:'Mein Tag in Berlin: der Plan für heute',src:'YouTube · jiayouchinese',lvl:'A2',
   ph:[['我们来看一下我今天的计划。','Wǒmen lái kàn yíxià wǒ jīntiān de jìhuà.','Schauen wir uns meinen Plan für heute an.'],['第一个是运动，半个小时左右。','Dì-yī ge shì yùndòng, bàn ge xiǎoshí zuǒyòu.','Das Erste ist Sport, ungefähr eine halbe Stunde.'],['所以我要多运动。','Suǒyǐ wǒ yào duō yùndòng.','Deshalb will ich mehr Sport machen.'],['第二件事情是回邮件。','Dì-èr jiàn shìqing shì huí yóujiàn.','Das Zweite ist, E-Mails zu beantworten.']]}],
 'ce2-e2':[
  {id:'7ou-i6kEHsc',title:'Im Winter rausgehen: Schnee, Kälte, Anziehen',src:'YouTube · Emily Chinese',lvl:'A1–A2',
   ph:[['外面的温度现在是零下大概两度。','Wàimiàn de wēndù xiànzài shì língxià dàgài liǎng dù.','Draußen sind es gerade etwa zwei Grad unter null.'],['零下','língxià','unter null'],['冷','lěng','kalt'],['穿','chuān','anziehen, tragen']]},
  {id:'6zuDnxE7gIs',title:'Dialog: Wetter und Jahreszeiten',src:'YouTube · OneCat Chinese',lvl:'A2',
   ph:[['今天天气怎么样？','Jīntiān tiānqì zěnmeyàng?','Wie ist das Wetter heute?'],['今天是晴天，天气很好。','Jīntiān shì qíngtiān, tiānqì hěn hǎo.','Heute ist es sonnig, das Wetter ist schön.'],['我喜欢下雪天。','Wǒ xǐhuan xiàxuě tiān.','Ich mag Schneetage.'],['你最喜欢哪个季节？','Nǐ zuì xǐhuan nǎge jìjié?','Welche Jahreszeit magst du am liebsten?'],['冬天可以堆雪人。','Dōngtiān kěyǐ duī xuěrén.','Im Winter kann man Schneemänner bauen.']]}],
 'ce2-e3':[
  {id:'Kq04YTh-PWU',title:'Straßeninterview in Taipeh: Pläne und Wünsche zum Neujahr',src:'YouTube · PeggyTeachesChinese',lvl:'A2–B1',
   ph:[['猪年行大运！','Zhū nián xíng dà yùn!','Viel Glück im Jahr des Schweins!']]},
  {id:'LAoke1XI_BI',start:5,title:'Das Frühlingsfest in langsamem Chinesisch erklärt',src:'YouTube · Spicy Mandarin Talks',lvl:'B1',
   ph:[['过两天，就要到中国的新年了。','Guò liǎng tiān, jiù yào dào Zhōngguó de xīnnián le.','In zwei Tagen ist das chinesische Neujahr.'],['我们也叫它春节。','Wǒmen yě jiào tā Chūnjié.','Wir nennen es auch Frühlingsfest.'],['回家过年','huí jiā guònián','zum Neujahr nach Hause fahren'],['放鞭炮','fàng biānpào','Böller zünden'],['年夜饭','niányèfàn','Essen am Silvesterabend']]}],
 'ce2-e4':[
  {id:'aU4vOAlWje8',start:30,end:235,title:'Mit der U-Bahn ins Stadtzentrum',src:'YouTube · Real-Life Chinese with Shanshan',lvl:'A1–A2',
   ph:[['我今天要去市中心。','Wǒ jīntiān yào qù shì zhōngxīn.','Ich fahre heute ins Stadtzentrum.'],['现在我要进站。','Xiànzài wǒ yào jìn zhàn.','Jetzt gehe ich in die Station.'],['进站要先过安检。','Jìn zhàn yào xiān guò ānjiǎn.','Vor dem Betreten muss man durch die Sicherheitskontrolle.'],['我到了，我要出站。','Wǒ dào le, wǒ yào chū zhàn.','Ich bin da, ich verlasse die Station.']]},
  {id:'JDTQGy-VeLs',title:'Mit der U-Bahn zum Bahnhof (ohne Untertitel)',src:'YouTube · Real Chinese',lvl:'A2–B1',ph:[]}],
 'ce2-e5':[
  {id:'e8axxyWFSGQ',title:'Im Hotel einchecken: Szene an der Rezeption',src:'YouTube · 东华旅游汉语',lvl:'A2',
   ph:[['是那两位女士跟您入住，对吗？','Shì nà liǎng wèi nǚshì gēn nín rùzhù, duì ma?','Die beiden Damen checken mit Ihnen ein, richtig?'],['请您报一下您的手机号码。','Qǐng nín bào yíxià nín de shǒujī hàomǎ.','Nennen Sie mir bitte Ihre Handynummer.'],['好的，请稍等。','Hǎo de, qǐng shāo děng.','Gut, einen Moment bitte.'],['你们坐那儿等一会吧。','Nǐmen zuò nàr děng yíhuì ba.','Setzen Sie sich dort hin und warten Sie einen Moment.']]},
  {id:'ELZtH462Io0',title:'Einchecken und Auschecken, langsam erklärt',src:'YouTube · Comfy Chinese',lvl:'A1–A2',
   ph:[['酒店的入住时间是下午两点。','Jiǔdiàn de rùzhù shíjiān shì xiàwǔ liǎng diǎn.','Check-in im Hotel ist um 14 Uhr.'],['现在他要退房了。','Xiànzài tā yào tuìfáng le.','Jetzt checkt er aus.'],['预订','yùdìng','reservieren'],['前台','qiántái','Rezeption']]}],
 'ce2-e6':[
  {id:'Z4Ka3MEwJ6E',title:'Was man in China besser nicht tut',src:'YouTube · Zhen Into Chinese',lvl:'A2–B1',
   ph:[['但是在中国是不可以的。','Dànshì zài Zhōngguó shì bù kěyǐ de.','Aber in China geht das nicht.'],['不礼貌','bù lǐmào','unhöflich'],['直接指出别人的错误','zhíjiē zhǐchū biérén de cuòwù','jemanden direkt auf seinen Fehler hinweisen'],['你不能只考虑自己。','Nǐ bù néng zhǐ kǎolǜ zìjǐ.','Du darfst nicht nur an dich denken.']]},
  {id:'aiVHQDnWshI',title:'Schilder lesen: 20 Hinweise und Verbote',src:'YouTube · Slow Easy Chinese',lvl:'A1–A2',
   ph:[['节约用水','jiéyuē yòngshuǐ','Wasser sparen']]}],
 'ce2-e7':[
  {id:'-3PaTfnyzYQ',start:0,end:230,title:'Feuertopf essen in Chengdu',src:'YouTube · Nihao Chinese',lvl:'A2',
   ph:[['火锅在成都非常的有名。','Huǒguō zài Chéngdū fēicháng de yǒumíng.','Feuertopf ist in Chengdu sehr berühmt.'],['今天就跟我一起去吃火锅吧。','Jīntiān jiù gēn wǒ yìqǐ qù chī huǒguō ba.','Komm heute mit mir Feuertopf essen.'],['没有辣椒的叫清汤。','Méiyǒu làjiāo de jiào qīngtāng.','Die Brühe ohne Chili heißt klare Brühe.'],['有辣椒的是红汤。','Yǒu làjiāo de shì hóngtāng.','Die mit Chili ist die rote Brühe.'],['好吃！','Hǎochī!','Lecker!']]},
  {id:'p0jFSceGkcE',title:'Straßeninterview: Gibt es etwas, das du nicht isst?',src:'YouTube · Easy Mandarin',lvl:'A2',ph:[]}],
 'ce2-e8':[
  {id:'cZAGeDmUoYw',title:'Mit 100 Yuan über den Nachtmarkt',src:'YouTube · Chinese with Julie',lvl:'A2',
   ph:[['多少钱？','Duōshao qián?','Wie viel kostet das?'],['几块？','Jǐ kuài?','Wie viele Kuai?'],['还剩多少？','Hái shèng duōshao?','Wie viel ist noch übrig?']]},
  {id:'dPkgnLBcT20',start:240,end:385,title:'Dialog: Kleidung kaufen und handeln (Animation)',src:'YouTube · Yoyo Chinese',lvl:'A1–A2',
   ph:[['那条休闲裤多少钱？','Nà tiáo xiūxiánkù duōshao qián?','Was kostet die Freizeithose dort?'],['这两件一共多少钱？','Zhè liǎng jiàn yígòng duōshao qián?','Was kosten die beiden zusammen?'],['再便宜一点。','Zài piányi yìdiǎn.','Noch etwas billiger.'],['太贵了，三百块行吗？','Tài guì le, sānbǎi kuài xíng ma?','Zu teuer, gehen 300 Kuai?'],['真的不能便宜了。','Zhēn de bù néng piányi le.','Billiger geht es wirklich nicht.']]}],
 'ce2-e9':[
  {id:'frJkGgWYytg',start:265,end:400,title:'Bootsfahrt auf dem Li-Fluss bei Guilin',src:'YouTube · Chloe Chinese Class',lvl:'A2–B1',
   ph:[['现在我们一起看看风景吧。','Xiànzài wǒmen yìqǐ kànkan fēngjǐng ba.','Schauen wir uns jetzt zusammen die Landschaft an.'],['特别美。','Tèbié měi.','Besonders schön.'],['这就是桂林最有名的风景。','Zhè jiù shì Guìlín zuì yǒumíng de fēngjǐng.','Das ist die berühmteste Landschaft von Guilin.']]},
  {id:'_tLe3vzQrwU',start:1264,end:1400,title:'Die Reisterrassen von Longji',src:'YouTube · Chinese with Nicole',lvl:'A2–B1',
   ph:[['这里的风景是最好看的。','Zhèlǐ de fēngjǐng shì zuì hǎokàn de.','Die Landschaft hier ist am schönsten.'],['这里的梯田就像一面镜子。','Zhèlǐ de tītián jiù xiàng yí miàn jìngzi.','Die Reisterrassen hier sind wie ein Spiegel.'],['走到这里感觉风景慢慢变好看了。','Zǒu dào zhèlǐ gǎnjué fēngjǐng mànmàn biàn hǎokàn le.','Hier angekommen wird die Landschaft allmählich schöner.']]}],
 'ce2-e10':[
  {id:'jg5NBf3IlMg',start:89,end:199,title:'Straßeninterview in Peking: Wie wichtig ist das Aussehen?',src:'YouTube · China Admissions',lvl:'A2–B1',
   ph:[['我比较喜欢显瘦的。','Wǒ bǐjiào xǐhuan xiǎn shòu de.','Ich mag eher die, die schlank wirken.'],['看起来','kànqǐlái','aussehen, wirken'],['样子','yàngzi','Aussehen']]},
  {id:'IToewfNgmxg',title:'„她长什么样子？“ – Aussehen beschreiben',src:'YouTube · Ariel KK Chinese',lvl:'A2',
   ph:[['她长什么样子？','Tā zhǎng shénme yàngzi?','Wie sieht sie aus?']]}],
 'ce2-e11':[
  {id:'sIOQBFFZW6k',title:'Krank in China: Beschwerden nennen und ins Krankenhaus gehen',src:'YouTube · Un Thé Vert Chez Cléo',lvl:'A2',
   ph:[['今天我要去医院。','Jīntiān wǒ yào qù yīyuàn.','Heute gehe ich ins Krankenhaus.'],['我牙齿疼。','Wǒ yáchǐ téng.','Ich habe Zahnschmerzen.'],['我发烧了。','Wǒ fāshāo le.','Ich habe Fieber.'],['我头疼。','Wǒ tóuténg.','Ich habe Kopfschmerzen.'],['我嗓子疼。','Wǒ sǎngzi téng.','Ich habe Halsschmerzen.']]},
  {id:'woaP6aQRRgw',title:'Erkältet: Was man sagt, wenn man krank ist',src:'YouTube · Chinese with Mini',lvl:'A2',
   ph:[['我感冒了。','Wǒ gǎnmào le.','Ich bin erkältet.'],['前两天还有点发烧。','Qián liǎng tiān hái yǒudiǎn fāshāo.','Vor zwei Tagen hatte ich noch etwas Fieber.'],['不舒服','bù shūfu','sich unwohl fühlen'],['感冒药','gǎnmàoyào','Erkältungsmedizin']]}],
 'ce2-e12':[
  {id:'jg5NBf3IlMg',start:14,end:89,title:'Straßeninterview in Peking: Welche Eigenschaften zählen?',src:'YouTube · China Admissions',lvl:'A2–B1',
   ph:[['性格比较重要吧。','Xìnggé bǐjiào zhòngyào ba.','Der Charakter ist wohl wichtiger.'],['比较幽默','bǐjiào yōumò','eher humorvoll'],['善良','shànliáng','gutherzig']]},
  {id:'MyyUvRl-TvM',title:'Eine Freundschaft in China: jemanden vorstellen und beschreiben',src:'YouTube · Everyday Chinese',lvl:'A2',
   ph:[['我有很多中国朋友。','Wǒ yǒu hěn duō Zhōngguó péngyou.','Ich habe viele chinesische Freunde.']]}]
};
function vKey(pack){ if(VIDEOS[pack.id]) return pack.id; const m=/^ce2-(\d+)$/.exec(pack.deck||''); return m&&VIDEOS['ce2-e'+m[1]]?'ce2-e'+m[1]:null; }
function vUnit(k){ const m=/^ce(\d)-e(\d+)$/.exec(k)||[]; return 'Buch '+(m[1]||'1')+' · '+(m[2]==='0'?'Einstieg':'Einheit '+(m[2]||'')); }

// ---------------------------------------------------------------- helpers
const shuf=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pickN=(a,n)=>shuf(a).slice(0,n);
const TMK={'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4};
const VW='aeiouüvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜAEIOUĀÁǍÀĒÉĚÈŌÓǑÒ';
const SYL=new RegExp(`(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsywBPMFDTNLGKHJQXRZCSYW])?[${VW}]+(?:ng(?![${VW}])|n(?![${VW}])|r(?![${VW}]))?`,'g');
function toneOf(s){ for(const c of s.toLowerCase()) if(TMK[c]) return TMK[c]; return 5; }
function pyH(py){ return esc(py).replace(SYL,m=>`<span class="lt${toneOf(m)}">${m}</span>`); }
function sylls(py){ return String(py).match(SYL)||[]; }
const MARK={1:'̄',2:'́',3:'̌',4:'̀'};
function bare(s){ return s.normalize('NFD').replace(/[̀́̄̌]/g,'').normalize('NFC'); }
function setTone(s,t){ const b=bare(s); if(t===5) return b; const lo=b.toLowerCase(); let i=lo.search(/[ae]/); if(i<0) i=lo.indexOf('ou'); if(i<0){ for(let k=lo.length-1;k>=0;k--) if('iouü'.includes(lo[k])){ i=k; break; } } if(i<0) return b; return (b.slice(0,i+1)+MARK[t]+b.slice(i+1)).normalize('NFC'); }
function retone(py,tones){ let k=0; return String(py).replace(SYL,m=>setTone(m,tones[k++])); }
const PUN=/[，。！？、；：,.!?…“”"'‘’（）()\s]/g;
const clean=s=>String(s).replace(PUN,'');
function say(zh){ try{ sayZh(zh); }catch(e){} }
const lpA=new Audio(); lpA.preload='auto'; let lpStopAt=0;
lpA.addEventListener('timeupdate',()=>{ if(lpStopAt&&lpA.currentTime>=lpStopAt){ lpA.pause(); lpStopAt=0; } });
function playLine(pack,l){ const u=l.audio&&mediaUrl(pack,'audio/'+l.audio+'.mp3'); if(!u){ say(l.zh); return; }
  try{ if(lpA.src!==u) lpA.src=u; lpStopAt=Math.max(0,(l.t1||l.t0+4)-.08); const go=()=>{ lpA.currentTime=Math.max(0,l.t0-.05); lpA.play().catch(()=>say(l.zh)); }; if(lpA.readyState>=1) go(); else { lpA.onloadedmetadata=()=>{ lpA.onloadedmetadata=null; go(); }; lpA.load(); } }catch(e){ say(l.zh); } }
function stopLp(){ try{ lpA.pause(); }catch(e){} lpStopAt=0; }

// ---------------------------------------------------------------- Band 2: Einheiten aus den Vokabeln der App (bis die Buchscans da sind)
const VPACKS=Array.from({length:12},(_,i)=>({id:'v-ce2-'+(i+1),virtual:true,deck:'ce2-'+(i+1),unit:'Band 2 · Einheit '+(i+1),parts:[]}));
const anyPack=id=>packs.find(p=>p.id===id)||VPACKS.find(p=>p.id===id);
function vData(pack){ let ws=(pack.words?pack.words.map(w=>({zh:w[0],py:w[1]||'',de:w[2]})):(HZ.deckWords?HZ.deckWords(pack.deck):[])).filter(w=>w.zh&&w.de); const words=[], lines=[], chars=[], seen=new Set();
  const ord=new Map((pack.wordOrder||[]).map((x,i)=>[x[0],[x[1],i]]));
  if(ord.size){ ws=ws.map(w=>({...w,_o:ord.get(w.zh)||[3,999]}));
    // einzelne Restwörter nicht als eigenen Mini-Knoten zeigen: an die vorige Lektion hängen
    const cnt={}; ws.forEach(w=>cnt[w._o[0]]=(cnt[w._o[0]]||0)+1); const big=Object.keys(cnt).map(Number).filter(k=>cnt[k]>=3).sort((x,y)=>x-y);
    ws.forEach(w=>{ if(cnt[w._o[0]]<3&&big.length){ const t=big.filter(k=>k<w._o[0]).pop()||big[0]; w._o=[t,999]; } });
    ws.sort((a,b)=>a._o[0]-b._o[0]||a._o[1]-b._o[1]); }
  ws.forEach((w,i)=>{ const les=ord.size?w._o[0]:Math.floor(i/14)+1; words.push({zh:w.zh,py:w.py,de:w.de,les});
    if(w.s&&w.s[0]&&w.s[2]&&!seen.has(w.s[0])){ seen.add(w.s[0]); lines.push({zh:w.s[0],py:w.s[1]||'',de:w.s[2],sp:'',les,audio:null,t0:0,t1:0}); }
    [...w.zh].forEach(c=>{ if(/[\u4e00-\u9fff]/.test(c)&&window.CHARS&&window.CHARS[c]&&!chars.some(x=>x.zh===c)&&chars.length<16) chars.push({zh:c,py:[...w.zh].length===1?w.py:'',de:[...w.zh].length===1?w.de:'aus '+w.zh+' ('+w.de+')'}); }); });
  chars.forEach(c=>{ if(!c.py){ const w=ws.find(x=>x.zh===c.zh); if(w){ c.py=w.py; c.de=w.de; } else { const src=ws.find(x=>x.zh.includes(c.zh)); const sy=src&&sylls(src.py)[[...src.zh].indexOf(c.zh)]; c.py=sy||''; } } });
  return {words,lines,orders:[],chars,notes:[]}; }

// ---------------------------------------------------------------- data from a pack
function unitData(pack){
  if(pack.virtual) return vData(pack);
  const words=[], seen=new Set(), lines=[], lseen=new Set(), orders=[], chars=[], notes=[];
  pack.parts.forEach((pt,pi)=>pt.sections.forEach((s,si)=>{
    let les=lesOf(pt,s); les=typeof les==='number'?les:99;
    s.ex.forEach(ex=>{
      if(pack.companion&&(ex.type==='vocab'||ex.type==='text')) return;
      if(ex.type==='vocab'&&(pt.id==='LB'||pt.id==='AB')) (ex.words||[]).forEach(w=>{ const zh=String(w[0]||'').replace(/[…\.]/g,'').trim(); if(!zh||seen.has(zh)||/[A-Za-z]/.test(zh)||!w[2]) return; seen.add(zh); words.push({zh,py:w[1]||'',de:String(w[2]).replace(/\s*\((Pron|Adj|Verb|Nomen|Adv|Part|Konj|Präp|Num|ZEW|Fragew|N|V|MW|Interj|Suff|Pr|Eig)\.?\)/g,''),les}); });
      if(ex.type==='text'&&ex.lines&&pt.id==='LB') ex.lines.forEach((ln,i)=>{ if(!ln.zh||!ln.de||lseen.has(ln.zh)) return; lseen.add(ln.zh); const nx=ex.lines.slice(i+1).find(x=>typeof x.t==='number'); const hasT=typeof ln.t==='number'&&ex.audio;
        lines.push({zh:ln.zh,py:ln.py||'',de:ln.de,sp:ln.s||'',les,audio:hasT?ex.audio:null,t0:hasT?ln.t:0,t1:hasT?(nx?nx.t:ln.t+4):0}); });
      if(ex.type==='order') (ex.items||[]).forEach(it=>{ if(it.chunks&&it.ans&&it.ans[0]) orders.push({chunks:it.chunks,ans:it.ans,pre:it.pre||'',end:it.end||'',les}); });
      if(ex.type==='write') (ex.chars||[]).forEach(c=>{ if(window.CHARS&&window.CHARS[c[0]]&&!chars.some(x=>x.zh===c[0])) chars.push({zh:c[0],py:c[1]||'',de:c[2]||''}); });
      if(ex.type==='note'&&(ex.g||/Grammatik/i.test(ex.title||''))&&ex.blocks) notes.push({title:ex.title,blocks:ex.blocks,les});
    });
  }));
  if(pack.companion){ const V=vData(pack); words.push(...V.words); lines.push(...V.lines); if(!chars.length) chars.push(...V.chars); }
  return {words,lines,orders,chars,notes};
}
function findTest(pack){ let r=null; pack.parts.forEach((pt,pi)=>pt.sections.forEach((s,si)=>{ if(s.test&&!r) r={pi,si}; })); return r; }
const NCACHE=new Map();
function buildNodes(pack){
  if(NCACHE.has(pack.id)) return NCACHE.get(pack.id);
  const D=unitData(pack), nodes=[];
  const nums=[...new Set(D.words.map(w=>w.les).concat(D.lines.map(l=>l.les)).concat(pack.companion?pack.parts.filter(pt=>pt.id==='LB'||pt.id==='AB').flatMap(pt=>pt.sections.map(s=>lesOf(pt,s)).filter(x=>typeof x==='number')):[]))].sort((a,b)=>a-b);
  const addW=(ws,les)=>{ for(let i=0;i<ws.length;i+=7){ let part=ws.slice(i,i+7); if(part.length<3&&nodes.length&&nodes[nodes.length-1].kind==='words'){ nodes[nodes.length-1].words.push(...part); continue; }
      nodes.push({id:'w'+les+'-'+i,kind:'words',les,words:part,label:part.slice(0,3).map(w=>clean(w.zh)).join(' · '),sub:les===99?'Mehr Wörter':(pack.virtual||(pack.companion&&!pack.wordOrder)?'Wörter · Teil ':'Wörter · Lektion ')+les}); } };
  for(const n of nums){ addW(n===99?D.words.filter(w=>w.les===99&&[...clean(w.zh)].length<=3).slice(0,14):D.words.filter(w=>w.les===n),n);
    if(D.lines.filter(l=>l.les===n).length>=3) nodes.push({id:'d'+n,kind:'dialog',les:n,label:pack.companion?'Sätze bauen':n===99?'Sätze':'Sätze & Dialog',sub:n===99?'Hören und bauen':(pack.virtual||(pack.companion&&!pack.wordOrder)?'Teil ':'Lektion ')+n});
    if(pack.companion) pack.parts.forEach((pt,pi)=>{ if(pt.id!=='LB'&&pt.id!=='AB') return; pt.sections.forEach((s,si)=>{ if(lesOf(pt,s)!==n||/Schriftzeichen schreiben/.test(s.title)) return; nodes.push({id:'b'+pt.id+si,kind:'book',ref:{pi,si},label:s.title.replace(/^(Einheit \d+|Lektion \d)\s*·\s*/,'').replace(/^Lektion \d$/,'Übungen'),sub:(pt.id==='LB'?'Lehrbuch':'Arbeitsbuch')+' · S. '+s.page}); }); }); }
  for(let i=0;i<D.chars.length;i+=8){ const cs=D.chars.slice(i,i+8); nodes.push({id:i?'wr'+i:'wr',kind:'write',chars:cs,label:cs.slice(0,4).map(c=>c.zh).join(' '),sub:'Schreiben'}); }
  if(vKey(pack)) nodes.push({id:'vid',kind:'video',clip:0,label:'Echtes Leben',sub:'Video'});
  nodes.push({id:'rev',kind:'review',label:'Wiederholung',sub:'Truhe'});
  const t=findTest(pack); if(t) nodes.push({id:'test',kind:'test',ref:t,label:'Einheitentest',sub:'Prüfung'});
  const r={nodes,D}; NCACHE.set(pack.id,r); return r;
}
const nkey=(pack,n)=>pack.id+':'+n.id;
function nodeDone(pack,n){ if(n.kind==='book') return secDone(pack,pack.parts[n.ref.pi].sections[n.ref.si]); if(n.kind==='test') return !!(P.tests&&P.tests[pack.id+':'+pack.parts[n.ref.pi].sections[n.ref.si].id]); return !!LS.done[nkey(pack,n)]; }

// ---------------------------------------------------------------- item generation
function segDict(D){ const s=new Set(D.words.map(w=>w.zh)); packs.forEach(p=>{ if(p.id!==curLpPack?.id) buildNodes(p).D.words.forEach(w=>s.add(w.zh)); }); return s; }
function segment(zh,dict){ const a=[...zh], out=[]; let i=0; while(i<a.length){ let b=1; for(let l=Math.min(6,a.length-i);l>1;l--){ const sub=a.slice(i,i+l).join(''); if(dict.has(sub)||HZ.hasWord(sub)){ b=l; break; } } out.push(a.slice(i,i+b).join('')); i+=b; } return out; }
function buildable(l,dict){ const tg=clean(l.zh); if(!tg||[...tg].length>16||/[A-Za-z0-9]/.test(tg)) return null; const tiles=segment(tg,dict); if(tiles.length<2||tiles.length>8) return null; return tiles; }
function wordItems(ws,pool){ const it=[];
  for(let g=0;g<ws.length;g+=3){ const grp=ws.slice(g,g+3); grp.forEach(w=>it.push({t:'teach',w})); grp.forEach(w=>it.push({t:'meaning',w,pool})); shuf(grp).forEach(w=>it.push({t:'listen',w,pool})); }
  if(ws.length>=3) it.push({t:'pairs',ws:pickN(ws,Math.min(5,ws.length))});
  pickN(ws.filter(w=>{ const n=sylls(w.py).length; return n>=1&&n<=2; }),2).forEach(w=>it.push({t:'tone',w}));
  pickN(ws,Math.min(4,ws.length)).forEach(w=>it.push({t:'reverse',w,pool}));
  return it; }
function genItems(pack,node){
  const {D}=buildNodes(pack), pool=D.words;
  if(node.kind==='words'){ const prev=pool.filter(w=>w.les<node.les||(w.les===node.les&&!node.words.includes(w))); const it=wordItems(node.words,pool); pickN(prev,2).forEach(w=>it.push({t:Math.random()<.5?'listen':'meaning',w,pool})); return it; }
  if(node.kind==='dialog'){ const dict=segDict(D); const ls=D.lines.filter(l=>l.les===node.les), it=[];
    const nt=D.notes.find(n=>n.les===node.les)||D.notes[(node.les-1)%Math.max(1,D.notes.length)]; if(nt) it.push({t:'tip',n:nt});
    const au=ls.filter(l=>l.audio); pickN(au,5).forEach(l=>it.push({t:'dlisten',l,ls:D.lines}));
    pickN(ls,4).forEach(l=>it.push({t:'lmean',l,ls:D.lines}));
    pickN(ls.map(l=>({l,tiles:buildable(l,dict)})).filter(x=>x.tiles),4).forEach(x=>it.push({t:'build',l:x.l,tiles:x.tiles,pool}));
    pickN(D.orders.filter(o=>o.les===node.les),3).forEach(o=>it.push({t:'order',o}));
    pickN(pool.filter(w=>w.les<=node.les),3).forEach(w=>it.push({t:'meaning',w,pool}));
    const head=it[0]&&it[0].t==='tip'?[it.shift()]:[]; return head.concat(mix(it)); }
  if(node.kind==='write'){ const cs=(node.chars||D.chars).slice(0,8), it=[]; cs.forEach(c=>it.push({t:'trace',c})); shuf(cs).forEach(c=>it.push({t:'recall',c})); return it; }
  if(node.kind==='review'||node.kind==='mist'){ const dict=segDict(D); const it=[];
    LS.mist.filter(m=>node.kind==='mist'||m.p===pack.id).slice(-10).forEach(m=>{ const x=fromMist(m); if(x) it.push(x); });
    if(node.kind==='review'){ pickN(pool,6).forEach(w=>it.push({t:['meaning','listen','reverse'][Math.floor(Math.random()*3)],w,pool}));
      if(pool.length>=4) it.push({t:'pairs',ws:pickN(pool,5)});
      pickN(D.lines.filter(l=>l.audio),3).forEach(l=>it.push({t:'dlisten',l,ls:D.lines}));
      pickN(D.lines.map(l=>({l,tiles:buildable(l,dict)})).filter(x=>x.tiles),3).forEach(x=>it.push({t:'build',l:x.l,tiles:x.tiles,pool})); }
    return mix(it); }
  if(node.kind==='video'){ const v=VIDEOS[node.unit||vKey(pack)][node.clip||0], it=[{t:'vprep',v},{t:'vwatch',v},{t:'vrate',v}];
    const ph=v.ph.map(p=>({zh:p[0],py:p[1],de:p[2]})); const pp=ph.concat(pool).filter((w,i,a)=>a.findIndex(x=>x.zh===w.zh)===i);
    if(ph.length>=2){ ph.forEach(w=>it.push({t:'listen',w,pool:pp})); ph.forEach(w=>it.push({t:'vspeak',w})); }
    return it; }
  return [];
}
function mix(it){ const by={}; it.forEach(x=>(by[x.t]=by[x.t]||[]).push(x)); const ks=Object.keys(by), out=[]; while(ks.some(k=>by[k].length)) shuf(ks).forEach(k=>{ if(by[k].length) out.push(by[k].shift()); }); return out; }
function mistOf(it){ const w=it.w||it.c, l=it.l; if(w) return {t:it.t==='teach'||it.t==='pairs'?'meaning':it.t,zh:w.zh}; if(l) return {t:it.t,zh:l.zh}; if(it.o) return {t:'order',zh:it.o.ans[0]}; return null; }
function fromMist(m){ const pk=anyPack(m.p); if(!pk) return null; const {D}=buildNodes(pk);
  if(['meaning','listen','reverse','tone','trace','recall'].includes(m.t)){ const w=D.words.find(x=>x.zh===m.zh)||D.chars.find(x=>x.zh===m.zh); if(!w) return null; if(m.t==='trace'||m.t==='recall') return {t:'recall',c:w,_m:m}; return {t:m.t,w,pool:D.words,_m:m}; }
  if(m.t==='order'){ const o=D.orders.find(x=>x.ans[0]===m.zh); return o?{t:'order',o,_m:m}:null; }
  const l=D.lines.find(x=>x.zh===m.zh); if(!l) return null; if(m.t==='build'){ const tiles=buildable(l,segDict(D)); return tiles?{t:'build',l,tiles,pool:D.words,_m:m}:null; } return {t:m.t,l,ls:D.lines,_m:m}; }

// ---------------------------------------------------------------- styles (incl. moderner Look für die ganze App)
const lcss=`
:root{--paper:#f4f5fa;--paper2:#e9ebf3;--card:#fff;--ink:#14142b;--ink2:#55577a;--ink3:#8a8ca8;--seal:#5b4bff;--seal-soft:#eeebff;--jade:#10b97a;--jade-soft:#e3f8ef;--line:#e4e6f0;--r:22px;
 --fh:ui-rounded,"SF Pro Rounded",-apple-system,system-ui,sans-serif;--pink:#ff2d75;--coral:#ff5a36;--gold:#ffb020;--blue:#2f80ff}
html,body{font-family:ui-rounded,"SF Pro Rounded",-apple-system,system-ui,sans-serif!important}
body{background:var(--paper)!important}
#hzTabs{background:rgba(255,255,255,.94)!important;border-top:1px solid var(--line)!important}
#hzTabs button{font-weight:700!important;border-radius:16px!important}
#hzTabs button.on{color:var(--seal)!important;background:var(--seal-soft)!important;box-shadow:none!important}
.lp-fb.ok [class^=lt]{color:#fff!important}
.lt1{color:var(--t1)}.lt2{color:var(--t2)}.lt3{color:var(--t3)}.lt4{color:var(--t4)}.lt5{color:var(--ink3)}
#lp{position:fixed;inset:0;z-index:16;background:var(--paper);display:none;color:var(--ink);font-family:var(--fh)}
#lp.show{display:block}
#lp button{font-family:inherit}
#lp .zh,#lp .lz{font-family:"PingFang SC","Noto Sans SC","Hiragino Sans GB",sans-serif}
.lp-home{height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:22px 24px 110px;box-sizing:border-box}
.lp-cols{max-width:1180px;margin:0 auto;display:flex;gap:24px;align-items:flex-start}
.lp-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:18px}
.lp-side{width:300px;display:flex;flex-direction:column;gap:16px;position:sticky;top:0}
@media (max-width:900px){.lp-cols{flex-direction:column}.lp-side{width:100%;position:static}}
.lp-units{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.lp-units::-webkit-scrollbar{display:none}
.lp-units button{flex:none;padding:10px 16px;border-radius:999px;background:#fff;font-weight:700;font-size:14px;color:var(--ink2);box-shadow:0 2px 10px rgba(20,20,43,.05)}
.lp-units button.on{background:var(--ink);color:#fff}
.lp-hero{position:relative;border-radius:32px;padding:26px 30px;color:#fff;overflow:hidden;background:linear-gradient(120deg,#5b4bff 0%,#8b5cff 45%,#ff2d75 100%);box-shadow:0 18px 40px rgba(91,75,255,.28)}
.lp-hero:before{content:"";position:absolute;right:-30px;top:-40px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.12)}
.lp-hero .big{position:absolute;right:30px;top:20px;font-size:92px;font-weight:900;color:rgba(255,255,255,.22);line-height:1}
.lp-hero small{font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.85}
.lp-hero h2{font-size:32px;font-weight:800;margin:4px 0 14px;letter-spacing:-.02em}
.lp-hero .pb{display:flex;align-items:center;gap:12px;font-weight:700;font-size:14px}
.lp-hero .pb b{display:block;width:220px;height:10px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden}
.lp-hero .pb b i{display:block;height:100%;background:#fff;border-radius:99px}
.lp-path{background:#fff;border-radius:32px;box-shadow:0 10px 30px rgba(20,20,43,.06);padding:30px 20px 40px;display:flex;flex-direction:column;align-items:center;gap:22px}
.lp-node{display:flex;flex-direction:column;align-items:center;gap:8px;width:200px;position:relative}
.lp-node .nb{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:30px;font-weight:900;transition:transform .12s}
.lp-node .nb:active{transform:translateY(4px)}
.lp-node .nb svg{width:34px;height:34px}
.lp-node .nl{font-size:14px;font-weight:800;text-align:center;line-height:1.25}
.lp-node .ns{font-size:12px;font-weight:700;color:var(--ink3)}
.lp-node.todo .nb{background:#f1f2f8!important;box-shadow:0 7px 0 #dfe1ec!important;color:#b4b6cc}
.lp-node.todo .nl{color:var(--ink2)}
.lp-node.cur .nb{width:96px;height:96px;outline:8px solid rgba(91,75,255,.16)}
.lp-node .go{background:var(--ink);color:#fff;font-weight:800;font-size:12.5px;padding:6px 12px;border-radius:12px;letter-spacing:.05em}
.k-words .nb{background:linear-gradient(160deg,#7a6bff,#5b4bff);box-shadow:0 7px 0 #3f31d9}
.k-dialog .nb{background:linear-gradient(160deg,#ff7a59,#ff5a36);box-shadow:0 7px 0 #d93e1d}
.k-write .nb{background:linear-gradient(160deg,#2fd69a,#10b97a);box-shadow:0 7px 0 #0b8a5c}
.k-video .nb{background:linear-gradient(160deg,#ff5c93,#ff2d75);box-shadow:0 7px 0 #d1135a}
.k-book .nb{border-radius:24px;background:linear-gradient(160deg,#5aa2ff,#2f80ff);box-shadow:0 7px 0 #1b5fd0}
.k-review .nb{border-radius:28px;background:linear-gradient(160deg,#ffc34d,#ffb020);box-shadow:0 7px 0 #d98e00}
.k-test .nb{border-radius:28px;background:linear-gradient(160deg,#3a3c5c,#14142b);box-shadow:0 7px 0 #000}
.lp-card{background:#fff;border-radius:28px;padding:20px;box-shadow:0 10px 30px rgba(20,20,43,.06)}
.lp-card h4{margin:0 0 10px;font-size:17px;font-weight:800}
.lp-goal{display:flex;gap:16px;align-items:center}
.lp-ring{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;flex:none}
.lp-ring span{width:50px;height:50px;border-radius:50%;background:#fff;display:grid;place-items:center;font-weight:800;font-size:13px}
.lp-streak{background:var(--ink);color:#fff}
.lp-streak .wk{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:11px;font-weight:700;color:#a9abc7;margin-top:12px}
.lp-streak .wk i{display:block;height:28px;border-radius:9px;background:#2a2c4c;margin-bottom:4px}
.lp-streak .wk i.on{background:#ff9f1a}
.lp-fy{display:flex;align-items:center;gap:12px;padding:11px;border-radius:18px;width:100%;text-align:left;margin-top:8px}
.lp-fy .ic{width:42px;height:42px;border-radius:14px;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:900;flex:none}
.lp-fy b{display:block;font-size:14.5px}.lp-fy small{font-size:12.5px;color:var(--ink3);font-weight:600}
.lp-empty{padding:40px;text-align:center;color:var(--ink2);font-size:16px;line-height:1.5}
/* run */
.lp-run{height:100%;display:flex;flex-direction:column}
.lp-bar{display:flex;align-items:center;gap:16px;padding:16px 28px}
.lp-x{width:44px;height:44px;border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(20,20,43,.06);font-size:18px;color:var(--ink3);font-weight:800}
.lp-prog{flex:1;height:14px;border-radius:99px;background:#e4e6f0;overflow:hidden}
.lp-prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7a6bff,#5b4bff);transition:width .35s}
.lp-chip{min-width:44px;text-align:center;background:#fff;border-radius:99px;padding:8px 12px;font-weight:800;font-size:14px;color:#ff9f1a;box-shadow:0 4px 14px rgba(20,20,43,.06)}
.lp-stage{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:8px 28px 24px;display:flex;justify-content:center}
.lp-in{width:100%;max-width:860px;display:flex;flex-direction:column;gap:20px}
.lp-kind{font-size:13.5px;font-weight:800;color:var(--seal);letter-spacing:.06em;text-transform:uppercase}
.lp-q{font-size:30px;font-weight:800;letter-spacing:-.02em;margin:0;line-height:1.2}
.lp-big{display:flex;align-items:center;gap:18px}
.lp-snd{width:84px;height:84px;border-radius:26px;background:linear-gradient(160deg,#7a6bff,#5b4bff);box-shadow:0 6px 0 #3f31d9;color:#fff;font-size:34px;flex:none}
.lp-snd.sm{width:64px;height:64px;border-radius:20px;font-size:24px;background:#fff;color:var(--seal);box-shadow:0 6px 0 #e4e6f0}
.lp-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.lp-opt{min-height:96px;border-radius:24px;background:#fff;box-shadow:0 5px 0 #e4e6f0;border:2px solid #e4e6f0;padding:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:18px;font-weight:700;text-align:center}
.lp-opt .lz{font-size:44px;font-weight:600;line-height:1.1}
.lp-opt.sm .lz{font-size:26px}
.lp-opt .py{font-size:15px;font-weight:800}
.lp-opt.sel{border-color:var(--seal);box-shadow:0 5px 0 var(--seal);background:var(--seal-soft)}
.lp-opt.ok{border-color:var(--jade);box-shadow:0 5px 0 var(--jade);background:var(--jade-soft)}
.lp-opt.bad{border-color:#ff3b5c;box-shadow:0 5px 0 #ff3b5c;background:#ffe5ea}
.lp-opt.gone{visibility:hidden}
.lp-teach{background:#fff;border-radius:32px;box-shadow:0 14px 40px rgba(20,20,43,.08);padding:36px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.lp-teach .lz{font-size:110px;font-weight:600;line-height:1.1}
.lp-teach .py{font-size:30px;font-weight:800}
.lp-teach .de{font-size:20px;font-weight:600;color:var(--ink2)}
.lp-prompt{display:flex;align-items:center;gap:16px}
.lp-bub{background:#fff;border-radius:24px 24px 24px 6px;padding:16px 22px;font-size:22px;font-weight:700;box-shadow:0 6px 20px rgba(20,20,43,.06)}
.lp-bub .lz{font-size:34px;font-weight:600}
.lp-bub .py{display:block;font-size:15px;font-weight:700;margin-top:2px}
.lp-tray{min-height:92px;border-radius:26px;background:#fff;border:2px dashed #d6d8e6;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px}
.lp-bank{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.lp-tile{padding:12px 18px;border-radius:18px;background:#fff;box-shadow:0 5px 0 #e4e6f0;border:2px solid #e4e6f0;font-size:26px;font-weight:600;font-family:"PingFang SC","Noto Sans SC",sans-serif}
.lp-tile.ph{background:#e4e6f0;color:transparent;box-shadow:none;border-color:#e4e6f0}
.lp-pairs{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.lp-pairs .col{display:flex;flex-direction:column;gap:12px}
.lp-pairs .lp-opt{min-height:72px}
.lp-tip{background:#fff;border-radius:28px;padding:26px 30px;box-shadow:0 10px 30px rgba(20,20,43,.06);font-size:17px;line-height:1.55;color:var(--ink2)}
.lp-tip p{margin:0 0 10px}.lp-tip .r{display:flex;gap:14px;align-items:baseline;padding:6px 0;border-top:1px solid var(--line)}
.lp-tip .r .lz{font-size:24px;color:var(--ink)}
.lp-pad{position:relative;margin:0 auto;background:#fff;border-radius:36px;box-shadow:0 24px 60px rgba(20,20,43,.12);touch-action:none}
.lp-pad svg.lpg{position:absolute;left:0;top:0;pointer-events:none}
.lp-pad #lpHw{position:absolute;inset:0}
.lp-wrow{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap;justify-content:center}
.lp-winfo{width:300px;display:flex;flex-direction:column;gap:12px}
.lp-winfo .card{background:#fff;border-radius:26px;padding:20px;box-shadow:0 10px 30px rgba(20,20,43,.06)}
.lp-btn{height:56px;padding:0 28px;border-radius:18px;background:#fff;box-shadow:0 5px 0 #e4e6f0;border:2px solid #e4e6f0;font-weight:800;font-size:15px;color:var(--ink)}
.lp-video{position:relative;width:100%;padding-top:56.25%;border-radius:26px;overflow:hidden;background:#0f1024}
.lp-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.lp-vnote{font-size:13px;color:var(--ink3);font-weight:600}
.lp-foot{padding:18px 28px calc(18px + env(safe-area-inset-bottom));display:flex;justify-content:flex-end;gap:12px;border-top:1px solid var(--line);background:var(--paper)}
.lp-main-btn{height:60px;min-width:220px;padding:0 36px;border-radius:20px;background:var(--seal);color:#fff;font-weight:800;font-size:18px;box-shadow:0 5px 0 #3f31d9}
.lp-main-btn:disabled{background:#e4e6f0;color:#a9abc7;box-shadow:0 5px 0 #d6d8e6}
.lp-fb{display:flex;align-items:center;gap:20px;width:100%;border-radius:28px;padding:18px 24px;color:#fff}
.lp-fb.ok{background:linear-gradient(110deg,#16c784,#0fb5a0)}
.lp-fb.bad{background:#fff;color:var(--ink);border-top:6px solid #ff3b5c;box-shadow:0 14px 40px rgba(20,20,43,.10)}
.lp-fb .ic{width:60px;height:60px;border-radius:20px;background:rgba(255,255,255,.22);display:grid;place-items:center;font-size:30px;font-weight:900;flex:none}
.lp-fb.bad .ic{background:#ffe5ea;color:#e0233f}
.lp-fb .tx{flex:1;min-width:0}
.lp-fb h3{margin:0;font-size:24px;font-weight:800}.lp-fb.bad h3{color:#e0233f}
.lp-fb .sol{font-size:17px;font-weight:600;margin-top:4px}
.lp-fb .sol .lz{font-size:24px;font-weight:600}
.lp-fb .lp-main-btn{background:#fff;color:#0b8a5c;box-shadow:0 5px 0 rgba(0,0,0,.12)}
.lp-fb.bad .lp-main-btn{background:#ff3b5c;color:#fff;box-shadow:0 5px 0 #c41a38}
.lp-end{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;color:#fff;background:radial-gradient(circle at 50% 30%,#8b5cff 0%,#5b4bff 40%,#1b1660 100%);padding:20px;box-sizing:border-box;text-align:center}
.lp-end h2{font-size:42px;font-weight:800;margin:0;letter-spacing:-.02em}
.lp-end .st{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;width:min(620px,100%)}
.lp-end .st div{background:rgba(255,255,255,.12);border-radius:22px;padding:16px}
.lp-end .st small{font-size:12px;font-weight:800;letter-spacing:.1em;opacity:.75}
.lp-end .st b{display:block;font-size:34px;font-weight:800}
.lp-end .nw{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}
.lp-end .nw span{background:#fff;color:var(--ink);border-radius:14px;padding:6px 12px;font-size:20px}
.lp-end .lp-main-btn{background:#fff;color:var(--seal);box-shadow:0 6px 0 rgba(0,0,0,.18)}
body.lp-run-on #hzTabs{display:none}
.lp-vl{display:flex;gap:12px;align-items:center;padding:10px;border-radius:18px;width:100%;text-align:left}
.lp-vl .th{width:64px;height:44px;border-radius:12px;background:linear-gradient(135deg,#ff5c93,#ff2d75);display:grid;place-items:center;color:#fff;flex:none;font-size:16px}
.lp-vl b{display:block;font-size:13.5px;line-height:1.3}.lp-vl small{font-size:12px;color:var(--ink3);font-weight:700}
`;
{ const s2=document.createElement('style'); s2.textContent=lcss; document.head.appendChild(s2); }
const lp=document.createElement('div'); lp.id='lp'; document.body.appendChild(lp);
const BAO=(m='smile')=>`<svg viewBox="0 0 90 80" width="96" height="86" aria-hidden="true"><path d="M8 52c0-24 17-42 37-42s37 18 37 42c0 12-10 18-37 18S8 64 8 52z" fill="#FFF8EE" stroke="#14142B" stroke-width="3"/><path d="M45 12c-3 5-3 10 0 14M45 12c3 5 3 10 0 14M35 15c1 5 4 9 10 11M55 15c-1 5-4 9-10 11" fill="none" stroke="#14142B" stroke-width="2.4" stroke-linecap="round"/>${m==='happy'?'<path d="M28 47q5-6 10 0M52 47q5-6 10 0" fill="none" stroke="#14142B" stroke-width="3.2" stroke-linecap="round"/>':'<circle cx="33" cy="46" r="4" fill="#14142B"/><circle cx="57" cy="46" r="4" fill="#14142B"/>'}<ellipse cx="25" cy="55" rx="5" ry="3" fill="#FF9FB0"/><ellipse cx="65" cy="55" rx="5" ry="3" fill="#FF9FB0"/>${m==='happy'?'<path d="M37 53q8 11 16 0z" fill="#14142B"/>':'<path d="M39 54q6 6 12 0" fill="none" stroke="#14142B" stroke-width="3" stroke-linecap="round"/>'}</svg>`;
const ICON={book:'<svg viewBox="0 0 24 24"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>',words:'字',dialog:'<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>',write:'<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>',video:'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="#fff"/></svg>',review:'<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M3 12h18M12 11v3" stroke="#fff" stroke-width="2.4"/></svg>',test:'<svg viewBox="0 0 24 24"><path d="M12 3l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 15.2 7 18l1.2-5.6L4 8.6l5.6-.6z" fill="#fff"/></svg>'};
const CHECK='<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ---------------------------------------------------------------- home
let curLpPack=null;
async function openLp(){ closePagesIfOpen(); stopAudio(); root.classList.remove('show'); setTab('lernen'); lp.classList.add('show'); await loadPacks(); NCACHE.clear(); lpHome(); }
function closeLp(){ stopLp(); lp.classList.remove('show'); document.body.classList.remove('lp-run-on'); run=null; }
function lpHome(){
  run=null; document.body.classList.remove('lp-run-on'); stopLp();
  const b1=UNITS.map(u=>packs.find(p=>p.id===u[0])).filter(Boolean);
  const b2=VPACKS.map(v=>packs.find(p=>p.deck===v.deck&&p.band===2)||v);
  const ord=b1.concat(b2,packs.filter(p=>p.deck&&!b1.includes(p)&&!b2.includes(p)));
  { const m=/^v-ce2-(\d+)$/.exec(LS.unit||''); const rp=m&&packs.find(p=>p.band===2&&p.deck==='ce2-'+m[1]); if(rp){ LS.unit=rp.id; saveL(); } }
  if(!LS.b2){ LS.b2=1; LS.unit='v-ce2-3'; saveL(); }
  if(!ord.length){ lp.innerHTML=`<div class="lp-home"><div class="lp-empty">${BAO()}<h2>Noch keine Lektionspakete</h2>Importiere deine Pakete im Bereich <b>Buch</b>, dann entsteht hier dein Lernpfad.<br><br><button class="lp-main-btn" id="lpImp">Zum Buch</button></div></div>`; $('lpImp').onclick=()=>{ lp.classList.remove('show'); root.classList.add('show'); applyView(); showHome(); }; return; }
  let pack=ord.find(p=>p.id===LS.unit)||ord.find(p=>buildNodes(p).nodes.some(n=>!nodeDone(p,n)))||ord[0]; curLpPack=pack;
  if(pack.virtual&&pack.deck&&!HZ.hasDeck(pack.deck)){ try{ HZ.addDeck(pack.deck); }catch(e){} }
  const off_=navigator.onLine===false;
  const {nodes}=buildNodes(pack); const u=pack.virtual?[pack.id,'Einheit '+pack.deck.split('-')[1],nodes[0]&&nodes[0].words?nodes[0].words[0].zh:'',pack.unit]:(UNITS.find(x=>x[0]===pack.id)||[pack.id,pack.unit,pack.zh||pack.title||'',pack.de||'']);
  const dn=nodes.filter(n=>nodeDone(pack,n)).length; const nxt=nodes.findIndex(n=>!nodeDone(pack,n)&&!(off_&&n.kind==='video'));
  const off=[0,70,110,70,0,-70,-110,-70];
  const xp=xpToday(), pct=Math.min(100,Math.round(100*xp/XPGOAL)), sk=streakN();
  const days=['So','Mo','Di','Mi','Do','Fr','Sa']; const today=new Date().getDay();
  const mist=LS.mist.length, due=HZ.dueCount?HZ.dueCount():0;
  const vids=[]; Object.keys(VIDEOS).forEach(k=>VIDEOS[k].forEach((v,i)=>vids.push({k,i,v})));
  lp.innerHTML=`<div class="lp-home"><div class="lp-cols"><div class="lp-main">
    <div class="lp-units">${ord.map(p=>`<button data-u="${esc(p.id)}" class="${p.id===pack.id?'on':''}">${p.virtual||p.band===2?'B2 · '+p.deck.split('-')[1]+(p.band===2?' ●':''):'B1 · '+esc((UNITS.find(x=>x[0]===p.id)||[0,p.unit])[1]).replace('Einheit ','')}</button>`).join('')}</div>
    <div class="lp-hero"><div class="big lz">${esc(String(u[2]).replace(/[！？。]/g,'').slice(0,3))}</div><small>${esc(u[1])} · ${pack.virtual||pack.band===2?'Band 2':'Band 1'}</small><h2>${esc(pack.virtual?'Vokabeln & Sätze':(u[3]||u[2]))}</h2>${pack.virtual?'<div style="font-size:14px;font-weight:600;opacity:.9;margin:-8px 0 12px">Aus den Vokabeln deines Kurses · Buchübungen folgen mit den Scans</div>':''}
      <div class="pb"><b><i style="width:${Math.round(100*dn/nodes.length)}%"></i></b>${dn} von ${nodes.length} Knoten · je ca. 10 Min.</div></div>
    <div class="lp-path">${nodes.map((n,i)=>{ const d=nodeDone(pack,n), c=i===nxt; return `<div class="lp-node k-${n.kind} ${d?'done':c?'cur':'todo'}" style="transform:translateX(${off[i%off.length]}px)">${c?'<span class="go">START</span>':''}<button class="nb" data-n="${i}" aria-label="${esc(n.sub+': '+n.label)}">${d?CHECK:(n.kind==='words'?`<span class="lz">${esc([...n.words[0].zh][0])}</span>`:ICON[n.kind])}</button><span class="nl ${n.kind==='words'||n.kind==='write'?'lz':''}">${esc(n.label)}</span><span class="ns">${esc(n.kind==='video'&&off_?'Video · nur online':n.sub)}</span></div>`; }).join('')}</div>
  </div><aside class="lp-side">
    <div class="lp-card lp-goal"><div class="lp-ring" style="background:conic-gradient(var(--jade) 0 ${pct}%,#e3f8ef ${pct}% 100%)"><span>${pct}%</span></div><div><h4 style="margin:0">Tagesziel</h4><small style="color:var(--ink3);font-weight:700">${xp} von ${XPGOAL} XP</small></div></div>
    <div class="lp-card lp-streak"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:26px">🔥</span><b style="font-size:22px">${sk} ${sk===1?'Tag':'Tage'}</b><small style="color:#a9abc7;font-weight:700">Serie</small></div>
      <div class="wk">${[6,5,4,3,2,1,0].map(o=>{ const dd=new Date(Date.now()-o*864e5); const k=dd.getFullYear()+'-'+(dd.getMonth()+1)+'-'+dd.getDate(); return `<div><i class="${(LS.xp[k]||0)>=XPGOAL||(o<sk)?'on':''}"></i>${days[dd.getDay()]}</div>`; }).join('')}</div></div>
    <div class="lp-card"><h4>Für dich</h4>
      <button class="lp-fy" id="lpMist" style="background:#fff1ec"><span class="ic lz" style="background:var(--coral)">错</span><span><b>Fehler-Mix</b><small>${mist?mist+' offene Fehler':'keine offenen Fehler'}</small></span></button>
      <button class="lp-fy" id="lpCards" style="background:#e8faf2"><span class="ic lz" style="background:var(--jade)">写</span><span><b>Schreibkarten</b><small>${due?due+' fällig':'nichts fällig'}</small></span></button>
    </div>
    <div class="lp-card"><h4>Videos aus dem echten Leben</h4>${vids.map(x=>`<button class="lp-vl" data-vk="${x.k}" data-vi="${x.i}"><span class="th">▶</span><span><b>${esc(x.v.title)}</b><small>${esc(vUnit(x.k))} · ${esc(x.v.lvl)}${LS.vid[x.v.id]?' · gesehen':''}</small></span></button>`).join('')}<div class="lp-vnote" style="margin-top:8px">Eingebettet von YouTube · nur online</div></div>
  </aside></div></div>`;
  lp.querySelectorAll('.lp-units button').forEach(b=>b.onclick=()=>{ LS.unit=b.dataset.u; saveL(); lpHome(); });
  lp.querySelectorAll('.lp-node .nb').forEach(b=>b.onclick=()=>{ const n=nodes[+b.dataset.n]; if(n.kind==='video'&&navigator.onLine===false){ toast('Videos brauchen Internet – mach einfach mit dem nächsten Knoten weiter.'); return; } startNode(pack,n); });
  $('lpMist').onclick=()=>{ if(!LS.mist.length){ toast('Keine offenen Fehler. 很好！'); return; } startNode(pack,{id:'mist',kind:'mist',label:'Fehler-Mix'}); };
  $('lpCards').onclick=()=>{ closeLp(); closeBook(); };
  lp.querySelectorAll('.lp-vl').forEach(b=>b.onclick=()=>{ if(navigator.onLine===false){ toast('Videos brauchen Internet.'); return; } const k=b.dataset.vk, pk=packs.find(p=>p.id===k)||pack; startNode(pk,{id:'vid'+b.dataset.vi,kind:'video',unit:k,clip:+b.dataset.vi,label:'Video'}); });
  { const on=lp.querySelector('.lp-units .on'); if(on) on.scrollIntoView({inline:'center',block:'nearest'}); }
  const cur=lp.querySelector('.lp-node.cur'); if(cur&&cur.offsetTop>window.innerHeight*.6) lp.querySelector('.lp-home').scrollTop=cur.offsetTop-260;
}

// ---------------------------------------------------------------- run engine
let run=null;
function startNode(pack,node){
  if(node.kind==='test'||node.kind==='book'){ closeLp(); root.classList.add('show'); applyView(); prevView='home'; openSection(pack,node.ref.pi,node.ref.si); return; }
  curLpPack=pack; curPack=pack;
  const items=genItems(pack,node); if(!items.length){ toast('Für diesen Knoten gibt es noch keine Übungen.'); return; }
  run={pack,node,items,i:0,ok:0,tot:0,combo:0,t0:Date.now(),seen:new Set()};
  document.body.classList.add('lp-run-on'); showItem();
}
function showItem(){
  stopLp(); try{ ww2&&ww2.cancelQuiz(); }catch(e){} ww2=null;
  const it=run.items[run.i]; if(!it){ finish(); return; }
  lp.innerHTML=`<div class="lp-run"><div class="lp-bar"><button class="lp-x" id="lpX" aria-label="Beenden">✕</button><div class="lp-prog"><i style="width:${Math.round(100*run.i/run.items.length)}%"></i></div><span class="lp-chip">${run.combo>=3?'🔥 '+run.combo:(run.i+1)+'/'+run.items.length}</span></div>
    <div class="lp-stage"><div class="lp-in" id="lpIn"></div></div><div class="lp-foot" id="lpFoot"><button class="lp-main-btn" id="lpGo" disabled>Prüfen</button></div></div>`;
  $('lpX').onclick=()=>{ if(run.i<2||confirm('Lerneinheit beenden? Der Fortschritt dieses Knotens geht verloren.')) lpHome(); };
  const api={ ready(fn){ const b=$('lpGo'); b.disabled=false; b.onclick=()=>{ const r=fn(); if(r) feedback(r.ok,r.sol,r.note); }; },
    cont(label){ const b=$('lpGo'); b.disabled=false; b.textContent=label||'Weiter'; b.onclick=()=>{ run.i++; showItem(); }; },
    done(ok,sol,note){ feedback(ok,sol,note); }, unready(){ $('lpGo').disabled=true; } };
  (RI[it.t]||RI.teach)(it,$('lpIn'),api);
}
const PRAISE=['Richtig! 很好！','Super! 太棒了！','Genau! 对！','Klasse! 不错！'];
function feedback(ok,sol,note){
  const it=run.items[run.i]; const first=!it._retry;
  if(first){ run.tot++; if(ok) run.ok++; }
  run.combo=ok?run.combo+1:0;
  if(!ok){ if(!it._retry) run.items.push({...it,_retry:true}); const m=mistOf(it); if(m){ m.p=run.pack.id; if(!LS.mist.some(x=>x.p===m.p&&x.t===m.t&&x.zh===m.zh)) LS.mist.push(m); if(LS.mist.length>80) LS.mist.shift(); saveL(); } }
  else if(it._m||it._retry){ const m=it._m||mistOf(it); if(m){ LS.mist=LS.mist.filter(x=>!(x.p===(m.p||run.pack.id)&&x.t===m.t&&x.zh===m.zh)); saveL(); } }
  const f=$('lpFoot'); f.innerHTML=`<div class="lp-fb ${ok?'ok':'bad'}"><div class="ic">${ok?'✓':'✕'}</div><div class="tx"><h3>${ok?PRAISE[Math.floor(Math.random()*PRAISE.length)]:'Fast. Richtig ist:'}</h3>${sol?`<div class="sol">${sol}</div>`:''}${note?`<div class="sol" style="opacity:.85;font-size:14.5px">${note}</div>`:''}</div><button class="lp-main-btn" id="lpNext">${ok?'Weiter':'Verstanden'}</button></div>`;
  $('lpNext').onclick=()=>{ run.i++; showItem(); };
  lp.querySelectorAll('.lp-in button:not(.lp-snd)').forEach(b=>b.disabled=true);
}
function finish(){
  const {pack,node}=run; const acc=run.tot?run.ok/run.tot:1; const xp=10+Math.round(5*acc)+(node.kind==='video'?5:0);
  if(node.kind!=='mist'&&!/^vid\d/.test(node.id)) LS.done[nkey(pack,node)]={best:Math.max(acc,(LS.done[nkey(pack,node)]||{}).best||0),ts:Date.now()};
  if(/^vid\d/.test(node.id)||node.kind==='video'){ const v=VIDEOS[node.unit||vKey(pack)][node.clip||0]; LS.vid[v.id]=LS.vid[v.id]||1; }
  saveL(); addXP(xp);
  if(node.kind==='words'&&pack.deck&&!HZ.hasDeck(pack.deck)){ try{ HZ.addDeck(pack.deck); }catch(e){} }
  const sec=Math.round((Date.now()-run.t0)/1000); const nw=node.kind==='words'?node.words:[];
  lp.innerHTML=`<div class="lp-end">${BAO('happy').replace('width="96" height="86"','width="160" height="142"')}<h2>${node.kind==='mist'?'Fehler aufgeräumt!':'Knoten geschafft!'}</h2>
    <div style="font-size:18px;font-weight:600;opacity:.85">${node.kind==='video'?'Du hast echtes Chinesisch gehört. 加油！':acc>=.9?'Fast fehlerfrei. 太棒了！':'Fehler kommen in der Wiederholung nochmal.'}</div>
    <div class="st"><div><small>XP</small><b style="color:#ffb020">+${xp}</b></div><div><small>TREFFER</small><b style="color:#2fe3a0">${Math.round(acc*100)} %</b></div><div><small>ZEIT</small><b style="color:#8fd3ff">${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</b></div></div>
    ${nw.length?`<div class="nw"><small style="font-weight:700;opacity:.8">Neu in den Schreibkarten:</small>${nw.slice(0,6).map(w=>`<span class="lz">${esc(w.zh)}</span>`).join('')}</div>`:''}
    <button class="lp-main-btn" id="lpBack">Weiter zum Pfad</button></div>`;
  try{ HZ.confetti&&HZ.confetti(); }catch(e){}
  $('lpBack').onclick=()=>lpHome(); run=null; document.body.classList.remove('lp-run-on');
}

// ---------------------------------------------------------------- item renderers
const RI={};
const head=(kind,q)=>`<div class="lp-kind">${kind}</div><h2 class="lp-q">${q}</h2>`;
function choice(el,opts,api,sel){ let pick=-1; el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ el.querySelectorAll('[data-o]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); pick=+b.dataset.o; if(sel) sel(pick); api.ready(()=>{ const ok=opts[pick].ok; el.querySelectorAll('[data-o]').forEach((x,i)=>{ if(opts[i].ok) x.classList.add('ok'); else if(i===pick) x.classList.add('bad'); }); return {ok}; }); }); }
function distract(w,pool,field,n){ const seen=new Set([w[field]]); return shuf(pool).filter(x=>{ if(seen.has(x[field])||!x[field]) return false; seen.add(x[field]); return true; }).slice(0,n); }
RI.teach=(it,el,api)=>{ const w=it.w; el.innerHTML=head('Neues Wort','Merk dir dieses Wort')+`<div class="lp-teach"><div class="lz">${esc(w.zh)}</div><div class="py">${pyH(w.py)}</div><div class="de">${esc(w.de)}</div><button class="lp-snd sm" id="lpS">🔊</button></div>`; $('lpS').onclick=()=>say(w.zh); setTimeout(()=>say(w.zh),250); api.cont(); };
RI.meaning=(it,el,api)=>{ const w=it.w; const opts=shuf([{x:w,ok:true}].concat(distract(w,it.pool,'de',3).map(x=>({x,ok:false}))));
  el.innerHTML=head('Bedeutung','Was bedeutet das?')+`<div class="lp-big"><button class="lp-snd sm" id="lpS">🔊</button><div class="lp-bub"><span class="lz">${esc(w.zh)}</span><span class="py">${pyH(w.py)}</span></div></div><div class="lp-opts">${opts.map((o,i)=>`<button class="lp-opt" data-o="${i}">${esc(o.x.de)}</button>`).join('')}</div>`;
  $('lpS').onclick=()=>say(w.zh); setTimeout(()=>say(w.zh),250); choice(el,opts,api); const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); x.sol=`<span class="lz">${esc(w.zh)}</span> ${pyH(w.py)} · ${esc(w.de)}`; return x; }); };
RI.listen=(it,el,api)=>{ const w=it.w; const opts=shuf([{x:w,ok:true}].concat(distract(w,it.pool,'zh',3).map(x=>({x,ok:false}))));
  el.innerHTML=head('Hören','Was hörst du?')+`<div class="lp-big"><button class="lp-snd" id="lpS">🔊</button><button class="lp-snd sm" id="lpS2" title="langsam">🐢</button></div><div class="lp-opts">${opts.map((o,i)=>`<button class="lp-opt ${[...o.x.zh].length>3?'sm':''}" data-o="${i}"><span class="lz">${esc(o.x.zh)}</span></button>`).join('')}</div>`;
  $('lpS').onclick=()=>say(w.zh); $('lpS2').onclick=()=>{ try{ HZ.speak(w.zh); }catch(e){} }; setTimeout(()=>say(w.zh),300);
  choice(el,opts,api); const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); x.sol=`<span class="lz">${esc(w.zh)}</span> ${pyH(w.py)} · ${esc(w.de)}`; return x; }); };
RI.reverse=(it,el,api)=>{ const w=it.w; const opts=shuf([{x:w,ok:true}].concat(distract(w,it.pool,'zh',3).map(x=>({x,ok:false}))));
  el.innerHTML=head('Übersetzen','Wie sagt man …')+`<div class="lp-bub" style="align-self:flex-start">„${esc(w.de)}“</div><div class="lp-opts">${opts.map((o,i)=>`<button class="lp-opt ${[...o.x.zh].length>3?'sm':''}" data-o="${i}"><span class="lz">${esc(o.x.zh)}</span><span class="py">${pyH(o.x.py)}</span></button>`).join('')}</div>`;
  el.querySelectorAll('.lp-opt .py').forEach(x=>x.style.visibility='hidden');
  choice(el,opts,api,i=>say(opts[i].x.zh)); const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); x.sol=`<span class="lz">${esc(w.zh)}</span> ${pyH(w.py)}`; return x; }); };
RI.tone=(it,el,api)=>{ const w=it.w; const sy=sylls(w.py); const real=sy.map(toneOf); const set=new Set([real.join()]); const opts=[{py:w.py,ok:true}];
  let guard=0; while(opts.length<4&&guard++<60){ const t=real.map(x=>Math.random()<.7?1+Math.floor(Math.random()*4):x); if(set.has(t.join())) continue; set.add(t.join()); opts.push({py:retone(w.py,t),ok:false}); }
  const o2=shuf(opts);
  el.innerHTML=head('Töne','Welche Töne hörst du?')+`<div class="lp-big"><button class="lp-snd" id="lpS">🔊</button><div class="lp-bub"><span class="lz">${esc(w.zh)}</span><span class="py" style="color:var(--ink3)">${esc(bare(w.py))}</span></div></div><div class="lp-opts">${o2.map((o,i)=>`<button class="lp-opt" data-o="${i}"><span class="py" style="font-size:26px">${pyH(o.py)}</span></button>`).join('')}</div>`;
  $('lpS').onclick=()=>say(w.zh); setTimeout(()=>say(w.zh),300);
  choice(el,o2,api); const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); x.sol=`<span class="lz">${esc(w.zh)}</span> ${pyH(w.py)} · ${esc(w.de)}`; return x; }); };
RI.pairs=(it,el,api)=>{ const ws=it.ws, L1=shuf(ws), R1=shuf(ws); let sel=null, err=0, left=ws.length;
  el.innerHTML=head('Paare','Finde die Paare')+`<div class="lp-pairs"><div class="col">${L1.map(w=>`<button class="lp-opt" data-l="${esc(w.zh)}"><span class="lz" style="font-size:30px">${esc(w.zh)}</span></button>`).join('')}</div><div class="col">${R1.map(w=>`<button class="lp-opt" data-r="${esc(w.zh)}">${esc(w.de)}</button>`).join('')}</div></div>`;
  el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ el.querySelectorAll('[data-l]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); sel=b; say(b.dataset.l); });
  el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ if(!sel) return; if(sel.dataset.l===b.dataset.r){ [sel,b].forEach(x=>{ x.classList.remove('sel'); x.classList.add('ok'); x.disabled=true; }); sel=null; left--; if(!left) setTimeout(()=>api.done(err<=1,'Alle Paare gefunden.',err?`${err} Fehlversuch${err>1?'e':''}`:''),350); }
    else { err++; b.classList.add('bad'); setTimeout(()=>b.classList.remove('bad'),500); } }); };
RI.tip=(it,el,api)=>{ const n=it.n; el.innerHTML=head('Grammatik',esc(n.title.replace(/^Grammatik:\s*/,'')))+`<div class="lp-tip">${(n.blocks||[]).map(b=>b.p?`<p>${esc(b.p)}</p>`:b.rows?b.rows.map(r=>`<div class="r"><span class="lz">${esc(r.zh)}</span>${r.py?`<span>${pyH(r.py)}</span>`:''}${r.de?`<span style="color:var(--ink3)">${esc(r.de)}</span>`:''}</div>`).join(''):'').join('')}</div>`; api.cont('Verstanden'); };
function lineOpts(l,ls){ const o=[l].concat(shuf(ls.filter(x=>x.zh!==l.zh&&clean(x.zh)!==clean(l.zh))).slice(0,2)); return shuf(o.map(x=>({x,ok:x===l}))); }
RI.dlisten=(it,el,api)=>{ const l=it.l, opts=lineOpts(l,it.ls);
  el.innerHTML=head('Hören · Originalaufnahme','Was wird gesagt?')+`<div class="lp-big"><button class="lp-snd" id="lpS">🔊</button><div class="lp-vnote">${l.audio?'Lehrbuch Track '+esc(l.audio.replace(/^(LB|AB)/,'$1 ')):''}${l.sp?' · '+esc(l.sp):''}</div></div><div class="lp-opts" style="grid-template-columns:1fr">${opts.map((o,i)=>`<button class="lp-opt" data-o="${i}" style="min-height:70px;align-items:flex-start"><span class="lz" style="font-size:26px">${esc(o.x.zh)}</span></button>`).join('')}</div>`;
  $('lpS').onclick=()=>playLine(run.pack,l); setTimeout(()=>playLine(run.pack,l),300);
  choice(el,opts,api); const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); x.sol=`<span class="lz">${esc(l.zh)}</span><br>${pyH(l.py)} · ${esc(l.de)}`; return x; }); };
RI.lmean=(it,el,api)=>{ const l=it.l, opts=lineOpts(l,it.ls);
  el.innerHTML=head('Verstehen','Was bedeutet der Satz?')+`<div class="lp-big"><button class="lp-snd sm" id="lpS">🔊</button><div class="lp-bub"><span class="lz" style="font-size:28px">${esc(l.zh)}</span><span class="py">${pyH(l.py)}</span></div></div><div class="lp-opts" style="grid-template-columns:1fr">${opts.map((o,i)=>`<button class="lp-opt" data-o="${i}" style="min-height:64px">${esc(o.x.de)}</button>`).join('')}</div>`;
  $('lpS').onclick=()=>playLine(run.pack,l); choice(el,opts,api); const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); x.sol=esc(l.de); return x; }); };
function tiles(el,api,bank,check,solHTML){ const tray=el.querySelector('.lp-tray'), bk=el.querySelector('.lp-bank'); const placed=[];
  bk.innerHTML=bank.map((t,i)=>`<button class="lp-tile" data-i="${i}">${esc(t)}</button>`).join('');
  const draw=()=>{ tray.innerHTML=placed.map((i,k)=>`<button class="lp-tile" data-k="${k}">${esc(bank[i])}</button>`).join(''); bk.querySelectorAll('[data-i]').forEach(b=>b.classList.toggle('ph',placed.includes(+b.dataset.i)));
    tray.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ placed.splice(+b.dataset.k,1); draw(); }); if(placed.length) api.ready(()=>({ok:check(placed.map(i=>bank[i]).join('')),sol:solHTML})); else api.unready(); };
  bk.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; if(placed.includes(i)) return; placed.push(i); say(bank[i]); draw(); }); draw(); }
RI.build=(it,el,api)=>{ const l=it.l, tg=clean(l.zh); const extra=shuf(it.pool.map(w=>w.zh).filter(z=>!it.tiles.includes(z)&&!tg.includes(z)&&[...z].length<=2)).slice(0,2);
  el.innerHTML=head('Satz bauen','Übersetze den Satz')+`<div class="lp-prompt">${BAO()}<div class="lp-bub">„${esc(l.de)}“</div></div><div class="lp-tray"></div><div class="lp-bank"></div>`;
  tiles(el,api,shuf(it.tiles.concat(extra)),s=>s===tg,`<span class="lz">${esc(l.zh)}</span><br>${pyH(l.py)}`);
  const r=api.ready; api.ready=fn=>r(()=>{ const x=fn(); if(x.ok) playLine(run.pack,l); return x; }); };
RI.order=(it,el,api)=>{ const o=it.o; const acc=o.ans.map(clean);
  el.innerHTML=head('Satzbau · aus dem Buch','Bring die Teile in die richtige Reihenfolge')+`${o.pre?`<div class="lp-vnote">${esc(o.pre)}</div>`:''}<div class="lp-tray"></div><div class="lp-bank"></div>${o.end?`<div class="lp-vnote">Satzende: ${esc(o.end)}</div>`:''}`;
  tiles(el,api,shuf(o.chunks),s=>acc.includes(clean(s)),`<span class="lz">${esc(o.ans[0])}${esc(o.end)}</span>`); };
// writing
let ww2=null;
function lpPad(el,c,outline,onEnd){ const s=Math.max(240,Math.min(440,window.innerWidth-420,window.innerHeight-300));
  el.innerHTML=`<div class="lp-wrow"><div class="lp-winfo"><div class="lp-kind" style="color:#0fa06b">${outline?'Schreiben · nachzeichnen':'Schreiben · aus dem Gedächtnis'}</div><h2 class="lp-q">Schreib „${esc(c.de.split(/[,;–]/)[0])}“</h2>
    <div class="card"><div style="font-size:32px;font-weight:800">${pyH(c.py)}</div><div style="color:var(--ink2);font-weight:600;margin-top:6px">${esc(c.de)}</div></div>
    <div style="display:flex;gap:10px"><button class="lp-btn" id="lpWa">▶︎ Vorführen</button><button class="lp-btn" id="lpWs">🔊</button></div><div class="lp-vnote" id="lpWm"></div></div>
    <div class="lp-pad" id="lpPad" style="width:${s}px;height:${s}px"><svg class="lpg" style="width:${s}px;height:${s}px" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${gridSvg(s).replace(/#e6dccb/g,'#e8eaf2')}</svg><div id="lpHw"></div></div></div>`;
  let miss=0; const mk=()=>{ try{ ww2&&ww2.cancelQuiz(); }catch(e){} $('lpHw').innerHTML='';
    ww2=HanziWriter.create('lpHw',c.zh,{width:s,height:s,padding:Math.round(s*.06),showCharacter:false,showOutline:outline,strokeColor:'#14142b',outlineColor:'#dde0ec',drawingColor:'#14142b',drawingWidth:Math.max(14,Math.round(s/26)),highlightColor:'#10b97a',charDataLoader:(ch,ok,er)=>{ const d=window.CHARS[ch]; d?ok(d):er(new Error('no data')); }});
    ww2.quiz({leniency:1.4,showHintAfterMisses:outline?1:3,onMistake:()=>{ miss++; $('lpWm').textContent=`${miss} Fehlstrich${miss>1?'e':''}`; },onComplete:()=>setTimeout(()=>onEnd(miss),400)}); };
  mk(); { const g=$('lpGo'); g.textContent='Mit dem Pencil schreiben'; } $('lpWs').onclick=()=>say(c.zh); $('lpWa').onclick=()=>{ if(!ww2) return; try{ ww2.cancelQuiz(); }catch(e){} miss+=outline?0:2; ww2.animateCharacter({onComplete:mk}); }; setTimeout(()=>say(c.zh),300); }
RI.trace=(it,el,api)=>lpPad(el,it.c,true,m=>api.done(true,`<span class="lz">${esc(it.c.zh)}</span> ${pyH(it.c.py)}`,m?`${m} Fehlstriche – beim nächsten Mal ohne Vorlage.`:'Sauber nachgezeichnet!'));
RI.recall=(it,el,api)=>lpPad(el,it.c,false,m=>api.done(m<=3,`<span class="lz">${esc(it.c.zh)}</span> ${pyH(it.c.py)}`,m?`${m} Fehlstriche`:'Fehlerfrei aus dem Gedächtnis!'));
// video
const ytUrl=v=>`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=zh-Hans&hl=de${v.start?'&start='+v.start:''}${v.end?'&end='+v.end:''}`;
RI.vprep=(it,el,api)=>{ const v=it.v; el.innerHTML=head('Video · Vorbereiten',esc(v.title))+`<div class="lp-tip"><p>${v.ph.length?'Achte im Video auf diese Ausdrücke:':'Schau einfach zu und versuche, Wörter wiederzuerkennen, die du aus dem Buch kennst.'}</p>${v.ph.map(p=>`<div class="r"><button class="lp-snd sm" style="width:44px;height:44px;font-size:17px" data-z="${esc(p[0])}">🔊</button><span class="lz">${esc(p[0])}</span><span>${pyH(p[1])}</span><span style="color:var(--ink3)">${esc(p[2])}</span></div>`).join('')}<p class="lp-vnote" style="margin-top:12px">Quelle: ${esc(v.src)} · wird von YouTube eingebettet</p></div>`;
  el.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>say(b.dataset.z)); api.cont('Zum Video'); };
RI.vwatch=(it,el,api)=>{ const v=it.v; const on=navigator.onLine!==false;
  el.innerHTML=head('Video · Ansehen',esc(v.title))+(on?`<div class="lp-video"><iframe src="${ytUrl(v)}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`:`<div class="lp-tip">Du bist gerade offline. Videos laufen nur mit Internet – du kannst diesen Schritt überspringen und später nachholen.</div>`)+
  `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><a class="lp-btn" style="display:inline-flex;align-items:center;text-decoration:none" href="https://www.youtube.com/watch?v=${v.id}${v.start?'&t='+v.start+'s':''}" target="_blank" rel="noopener">Auf YouTube öffnen</a><span class="lp-vnote">Untertitel lassen sich im Player über „CC“ umschalten.${v.end?` Ausschnitt ${Math.floor(v.start/60)}:${String(v.start%60).padStart(2,'0')}–${Math.floor(v.end/60)}:${String(v.end%60).padStart(2,'0')}`:''}</span></div>`;
  api.cont(on?'Angesehen':'Überspringen'); };
RI.vrate=(it,el,api)=>{ const v=it.v; const o=[['Fast alles','很好！'],['Einiges','不错！'],['Wenig','加油！ Das ist normal bei echten Videos.']];
  el.innerHTML=head('Video · Verstehen','Wie viel hast du verstanden?')+`<div class="lp-opts">${o.map((x,i)=>`<button class="lp-opt" data-o="${i}">${x[0]}</button>`).join('')}</div>`;
  el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ LS.vid[v.id]=3-+b.dataset.o; saveL(); api.done(true,o[+b.dataset.o][1],''); }); };
RI.vspeak=(it,el,api)=>{ const w=it.w; el.innerHTML=head('Nachsprechen','Sprich laut nach')+`<div class="lp-teach"><div class="lz" style="font-size:64px">${esc(w.zh)}</div><div class="py">${pyH(w.py)}</div><div class="de">${esc(w.de)}</div><div style="display:flex;gap:10px"><button class="lp-snd sm" id="lpS">🔊</button><button class="lp-snd sm" id="lpS2">🐢</button></div></div>`;
  $('lpS').onclick=()=>say(w.zh); $('lpS2').onclick=()=>{ try{ HZ.speak(w.zh); }catch(e){} }; setTimeout(()=>say(w.zh),300); api.cont('Nachgesprochen'); };
window.HZPath={open:openLp,startNode,buildNodes,genItems,LS:()=>LS,cur:()=>run};
