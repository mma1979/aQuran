var app;app=angular.module("quran",["ngSanitize","ngStorage","ionic","mediaPlayer"]),app.constant("API","http://www.alfanous.org/jos2"),app.constant("EveryAyah","http://www.everyayah.com/data"),app.run(["$rootScope","AppCacheManager","Preferences","$window",function(e,n,r,t){return e.online=t.navigator.onLine,e.options=r,t.addEventListener("online",function(){return e.online=!0,e.$apply()}),t.addEventListener("offline",function(){return e.online=!1,e.$apply()})}]),app.config(["$stateProvider","$urlRouterProvider","$locationProvider","$logProvider",function(e,n){return e.state("reader",{url:"/reader/:current?highlight&scrollTo",templateUrl:"views/reader.html"}).state("aya",{url:"/aya/:gid?highlight",templateUrl:"views/aya.html",controller:"AyaController"}).state("navigate",{url:"/navigate",templateUrl:"views/navigation.html",controller:"NavigationController"}).state("search",{url:"/search?query",templateUrl:"views/search.html",controller:"SearchController"}).state("preferences",{url:"/preferences",templateUrl:"views/preferences.html",controller:"PreferencesController"}).state("themes",{url:"/preferences/themes",templateUrl:"views/themes.html",controller:"PreferencesController"}).state("sura-name",{url:"/preferences/sura_name",templateUrl:"views/sura_name.html",controller:"PreferencesController"}).state("explanations",{url:"/preferences/explanations",templateUrl:"views/explanations.html",controller:"ExplanationsController"}).state("recitations",{url:"/preferences/recitations",templateUrl:"views/recitations.html",controller:"RecitationsController"}).state("about",{url:"/about",templateUrl:"views/about.html",controller:["$http","$scope",function(e,n){return e.get("manifest.webapp",{headers:"application/json",cache:!0}).then(function(e){return n.info=e.data})}]}),n.otherwise("/reader/1")}]),app.controller("AyaController",["$scope","ContentService","$stateParams","$log",function(e,n,r){return e.progress={status:"init"},e.aya={gid:Number(r.gid||1)},n.ayas.then(function(n){return n.findOne(e.aya).exec().then(function(n){return e.aya=n,e.progress.status="ready"})})}]),app.controller("ContentController",["$rootScope","$scope","$state","$stateParams","$log","ContentService","Preferences",function(e,n,r,t,a,i){var o,u,s;return n.playlist=[],n.pages=[],n.view=_.defaults(t,n.options.reader.view),n.progress={status:"init",total:0,current:0},n.$watch("scrollTo",function(e,r){return e>r?n.loadMore():void 0}),s=function(e){return _.chain(e).map(function(e,r){return n.playlist.push(e.recitation),e.index=r,e}).value()},u=function(){var r;return r={},r[n.view.type]=n.view.current,i.ayas.then(function(e){return e.find(r).exec()}).then(s).then(function(r){return a.debug("Content ready",r),e.title=r[0].sura_name,n.progress.status="ready",r},o,function(e){return n.progress.message=e})},n.loadMore=function(){return n.view.current++,u().then(function(e){return n.pages.push(e),n.$broadcast("scroll.infiniteScrollComplete")})},u().then(function(e){return n.pages.push(e),n.options.first_time=!1,n.scrollTo=t.scrollTo}),o=function(e){return n.progress.status="error",n.error=e,a.error("Error",e)}}]),app.controller("ExplanationsController",["$scope","$log","ExplanationService",function(e,n,r){return e.explanations={enabled:[],available:[]},r.properties.then(function(r){var t;return t=function(e){return _.chain(e).sortBy(["language","name"]).value()},e.toggle=function(n){return e.isEnabled(n)?_.remove(e.explanations.enabled,{id:n.id}):e.explanations.enabled.push(n),e.options.explanations.ids=_.pluck(e.explanations.enabled,"id")},e.isEnabled=function(n){return _.contains(e.options.explanations.ids,n.id)},r.find().exec().then(function(r){return n.debug(r),e.explanations.available=t(r),e.explanations.enabled=_.filter(e.explanations.available,function(n){return _.contains(e.options.explanations.ids,n.id)})})})["catch"](function(e){return n.error(e)})}]),app.controller("NavigationController",["ContentService","CacheService","$scope","$log",function(e,n,r){var t;return r.search={},r.views=[{id:"sura_id",display:"Sura",store:"suras"},{id:"juz_id",display:"Juz",store:"juzs"}],r.view=_.findWhere(r.views,function(e){return e.id===r.options.nav.view.id}),t=function(e){return _.map(e,function(e){return e.title=function(){switch(r.view.id){case"sura_id":return e[r.options.reader.sura_name];case"juz_id":return e.juz_id}}(),e})},r.$watch("view.id",function(a){var i;return i=n.get("navigation."+a),i||(i=e[r.view.store].then(function(e){return e.find(r.view.id).exec()}),n.put("navigation."+a,i)),i.then(t).then(function(e){return r.items=e}),r.options.nav.view.id=a})}]),app.controller("PreferencesController",["$scope","$log","ExplanationService",function(e){return e.sura_names=[{value:"sura_name",name:"Arabic",example:"الفاتحة"},{value:"sura_name_en",name:"English",example:"The Opening"},{value:"sura_name_romanization",name:"Romanized",example:"Al-Fatiha"}],e.$watch("options.reader.arabic_text",function(n){return n?void 0:e.options.explanations.enabled=!0}),e.themes=[{id:"light",name:"Light"},{id:"stable",name:"Stable"},{id:"positive",name:"Positive"},{id:"calm",name:"Calm"},{id:"balanced",name:"Balanced"},{id:"energized",name:"Energized"},{id:"assertive",name:"Assertive"},{id:"royal",name:"Royal"},{id:"dark",name:"Dark"}]}]),app.controller("RecitationsController",["$scope","$log","RecitationService",function(e,n,r){return e.recitations=[],r.properties.then(function(n){return n.find().exec().then(function(n){return e.recitations=_.chain(n).uniq(!0,"name").value()})})["catch"](function(e){return n.error(e)})}]),app.controller("SearchController",["$scope","$rootScope","$state","$log","$stateParams","SearchService","APIService",function(e,n,r,t,a,i,o){var u;return e.progress={status:"init",total:0,current:0,message:""},e.search={query:a.query||"",suggestions:[],results:[],execute:function(n){return null==n&&(n=e.search.query),n?(e.progress.status="searching",e.search.results=[],i.search(n).then(function(n){return t.debug("Found "+n.length+" results:",n),e.search.results=n,n})["catch"](function(e){if("NO_RESULTS"===e)return t.debug("No results found, going to fetch suggestions"),o.suggest(n);throw e}).then(function(n){return e.search.suggestions=n||[],t.debug("Suggestions:",e.search.suggestions),n}).then(function(){return e.progress.status="ready"})["catch"](u)):void 0}},e.search.execute(),u=function(n){return e.progress.status="error",e.error=n,t.error("Error:",n),e.$apply()}}]),app.directive("autoDirection",["LocalizationService",function(e){return{restrict:"ACE",link:function(n,r,t){return t.$observe("autoDirection",function(n){return n||(n=r.text()),r.attr("dir",e.isRTL(n)?"rtl":"ltr")})}}}]),app.directive("colorize",["ArabicService","$timeout","$log",function(e,n){var r;return r=function(n,r,t,a){var i;return null==a&&(a=!0),r&&t&&("string"==typeof t&&(t=e.getRegExp(t)),r=r.replace(t,"<span class='highlighted'>$1</span>")),i=a?n.split(/\s+/g).map(function(e){return"<span class='layers'> <span class='diacritics'>"+e+"</span> <span class='quranic-signs'>"+e+"</span> <span class='letters'>"+e+"</span> </span>"}).join(" "):n,r&&(i="<span class='search layers'> <span class='original'>"+r+"</span> <span class='overlay'>"+i+"</span> </span>"),i},{restrict:"A",replace:!0,link:function(e,t,a){return n(function(){var e,n,i,o;return e=!1,a.colorize&&"false"!==a.colorize&&(e=!0),o=a.colorizeText,n=a.highlight,i=a.searchText,o=r(o,i,n,e),t.html(o)})}}}]),app.directive("emphasize",["$timeout",function(e){return{restrict:"A",replace:!0,link:function(n,r,t){var a;return a=function(e,n){var r;return r=new RegExp("("+n+")","gi"),console.log(e.replace(r,"<em>$1</em>")),e.replace(r,"<em>$1</em>")},e(function(){var e;return e=t.emphasize,r.html(a(r.text(),e))})}}}]),app.directive("scrollTo",["$location","$anchorScroll","$timeout",function(e,n,r){var t;return t=function(n){return n?e.hash(""+n):void 0},{restrict:"A",replace:!1,link:function(e,a,i){return i.$observe("scrollTo",function(a){return e.$watch("$location.hash",function(){return r(n)}),t(a)})}}}]),app.factory("AudioSrcFactory",["$sce","EveryAyah","Preferences","RecitationService","$q","CacheService","$log",function(e,n,r,t,a,i,o){var u,s,c,l;return l=function(e,n){for(;n>0;)e+=e,n--;return e},u=function(e){return Math.max.apply(Math,e)},s=function(e){return Math.min.apply(Math,e)},c=function(e,n){return null==n&&(n="3"),e=l("0",n)+e,e.substr(e.length-3)},function(l,p){var f,d,m;return l=c(l),p=c(p),r.audio.auto_quality&&navigator.mozConnection?(f=function(){var e,n;return e=i.get("audio:"+r.audio.recitation.name+":quality"),e?a.when(e):(n=function(e){var n,t,a;return n=_.clone(e),t=r.connection.auto?navigator.mozConnection.bandwidth:r.connection.bandwidth,o.debug("Bandwidth:",t),o.debug("Available:",n),a=function(){switch(t){case 1/0:return u(n);default:return _.remove(n,function(e){return 8*e/1024>t}),u(n)}}(),0===n.length?s(e):a},t.properties.then(function(e){return e.find().where("name").is(r.audio.recitation.name).exec()}).then(function(e){return o.debug(e),e.map(function(e){return Number(e.subfolder.match(/(\d+)kbps/i)[1])})}).then(n).then(function(e){return i.put("audio:"+r.audio.recitation.name+":quality",e),e}))},f().then(function(t){var a;return a=r.audio.recitation.subfolder.match(/^(.+)_\d+kbps/i)[1],m=""+a+"_"+t+"kbps",d=""+n+"/"+m+"/"+l+p+".mp3",{src:e.trustAsResourceUrl(d),type:"audio/mp3"}})):(m=r.audio.recitation.subfolder,d=""+n+"/"+m+"/"+l+p+".mp3",a.when({src:e.trustAsResourceUrl(d),type:"audio/mp3"}))}}]),app.factory("ExplanationFactory",["ExplanationService",function(e){return function(n,r){return e.load(n).then(function(e){return e.findOne({gid:r}).exec()})}}]);var __slice=[].slice;app.factory("IDBStoreFactory",["$q","$http","$log","QueryBuilder","Preferences",function(e,n,r,t,a){return function(i,o){var u,s,c,l,p,f,d;return d=!1,o=_.defaults(o,{dbVersion:1,storePrefix:"",transforms:[],transformResponse:function(e){return e.data}}),s=e.defer(),l=function(){return s.notify({action:"STORE.FETCHING",data:{storeName:o.storeName}}),n.get(i,{cache:!0}).then(o.transformResponse)},u=function(){var n;return n=e.defer(),f.clear(function(){return n.resolve()},function(e){return r.error(e),n.reject(e)}),n.promise},p=function(n){var t;return s.notify({action:d?"STORE.UPDATING":"STORE.INSERTING",data:{storeName:o.storeName}}),t=e.defer(),f.putBatch(n,function(){return r.info("Data inserted."),a[""+o.storeName+"-version"]=o.dbVersion,t.resolve(f)},function(e){return t.reject(e)}),t.promise},c=function(e){return{find:function(){var n,r;return n=1<=arguments.length?__slice.call(arguments,0):[],(r=t(e,o.transforms)).find.apply(r,n)},findOne:function(){var n,r;return n=1<=arguments.length?__slice.call(arguments,0):[],(r=t(e,o.transforms)).findOne.apply(r,n)},findById:function(){var n,r;return n=1<=arguments.length?__slice.call(arguments,0):[],(r=t(e,o.transforms)).findById.apply(r,n)},findOneById:function(){var n,r;return n=1<=arguments.length?__slice.call(arguments,0):[],(r=t(e,o.transforms)).findOneById.apply(r,n)},where:function(){var n,r;return n=1<=arguments.length?__slice.call(arguments,0):[],(r=t(e,o.transforms)).where.apply(r,n)}}},f=new IDBStore(o),f.onStoreReady=function(){var e;return e=a[""+o.storeName+"-version"],e||(e=-1),e>-1&&(d=!0),Number(a[""+o.storeName+"-version"]===o.dbVersion)?s.resolve(f):e>o.dbVersion?u().then(l).then(p).then(s.resolve):l().then(p).then(s.resolve)},f.onError=function(e){return s.reject(e)},s.promise.then(c)}}]);var __slice=[].slice;app.factory("QueryBuilder",["$q","$log",function(e){return function(n,r){var t,a,i,o,u,s,c,l,p,f,d,m,h,g,v,y,x,b,w,S,$,E;return g=void 0,v=void 0,y=void 0,E=void 0,m=!1,h=!1,w="ASC",b=!1,$=r||[],S=function(e){return e instanceof Array?(y=e[0],E=e[1]||null):(y=e,E=y)},x=function(){var e;if(!y&&!E)return void 0;try{return n.makeKeyRange({lower:Math.min(y,E),excludeLower:m,upper:Math.max(y,E),excludeUpper:h})}catch(r){return e=r,y}},t=function(){var r,t,a,i;return r=e.defer(),i=function(e){return r.resolve(e)},t=function(e){return r.reject(e)},a={index:g,keyRange:x(),order:w,onError:t},n.query(i,a),r.promise.then(function(n){return $.length?e.all(n.map(function(e){var n,r,t;for(r=0,t=$.length;t>r;r++)n=$[r],e=n(e);return e})):n}).then(function(e){return b&&(e=e[0]||null),e})},p=function(){var e;return e=!0,{transform:f,exec:t}},f=function(e){return $.push(e),{exec:t}},s=function(e){return v=e,{transform:f,exec:t}},l=function(e){return(-1===Number(e)||e.match(/^des/gi))&&(w="DESC"),{limit:s,transform:f,exec:t}},c=function(){return{limit:s,transform:f,exec:t}},d=function(e){var n,r,a;return g=e,n=function(e,n){return y=e,E=n,m=!0,h=!0,{limit:s,sort:l,transform:f,exec:t}},r=function(e){return y=e,{limit:s,sort:l,transform:f,exec:t,to:function(e){return E=e,{limit:s,sort:l,transform:f,exec:t}}}},a=function(e){return e?(y=e,E=e,{exec:t}):{exec:t,from:r,between:n,transform:f}},{between:n,is:a,from:r,skip:c,limit:s,exec:t,transform:f}},a=function(){var e,n,r;switch(n=arguments[0],r=2<=arguments.length?__slice.call(arguments,1):[],!1){case!(!n||"string"==typeof n):return g=n,S(r),{exec:t,where:d,skip:c,limit:s,sort:l,transform:f};case"object"!=typeof n:if(e=_.keys(n),_.include(e,"limit")&&(s(n.limit),_.pull(e,"limit")),_.include(e,"sort")&&(l(n.sort),_.pull(e,"sort")),e.length>1)throw"QueryBuilder is limited to one key per query";return g=e[0],r=n[g],S(r),{exec:t,skip:c,limit:s,sort:l,transform:f}}},o=function(){var e;return e=1<=arguments.length?__slice.call(arguments,0):[],b=!0,e&&delete e.limit,s(1),a.apply(null,e)},i=function(){var e,n;return e=arguments[0],n=2<=arguments.length?__slice.call(arguments,1):[],g="id",a.apply(null,n)},u=function(){var e,n;return e=arguments[0],n=2<=arguments.length?__slice.call(arguments,1):[],g="id",o.apply(null,n)},{transform:f,find:a,findOne:o,findById:i,findOneById:u,where:d}}}]),app.filter("arabicNumber",["ArabicService",function(e){return function(n){return e.Numbers.Array.forEach(function(e,r){return n=n.replace(new RegExp(r.toString,"g"),r.toLocaleString())}),n}}]),app.filter("progress",[function(){var e;return e={"STORE.FETCHING":"Loading ${storeName} database from the server...","STORE.INSERTING":"Storing ${storeName} for offline use...","STORE.UPDATING":"Updating ${storeName} database..."},function(n){return _.template(e[n.action],n.data)}}]),app.service("APIService",["API","$http","$log",function(e,n,r){var t;return t=function(e){if(e.data.error.code===!0)throw"API Error";return e},{query:function(r){return n.get(e,{cache:!0,params:_.defaults(r,{action:"search",unit:"aya",traduction:1,fuzzy:"True"})})},suggest:function(a){return n.get(e,{params:{query:a,action:"suggest",unit:"aya"}}).then(t).then(function(e){var n;return r.debug("Response for suggestions",e),n=[],_(e.data.suggest).each(function(e,r){return e.forEach(function(e){return n.push({string:a.replace(r,e),replace:r,"with":e})})}),_.remove(n,{string:a}),n})}}}]),app.service("AppCacheManager",["$window","$rootScope","$log",function(e,n,r){return e.applicationCache.onchecking=function(e){return r.info("AppCache Checking...",e)},e.applicationCache.onupdateready=function(e){return r.info("AppCache Update Ready",e)},e.applicationCache.onobsolete=function(e){return r.info("AppCache Obsolete",e)},e.applicationCache.ondownloading=function(e){return r.info("AppCache Downloading...",e)},e.applicationCache.onprogress=function(e){return r.info("AppCache in progress",e)},e.applicationCache.onerror=function(e){return r.error("AppCache Error",e)},e.applicationCache.oncached=function(e){return r.info("AppCache Cached",e)},e.applicationCache}]),app.service("ArabicService",[function(){var e,n,r,t,a,i;return e=/[\u060c-\u06fe\ufb50-\ufefc]/g,n="([ًࣰًٌࣱٍࣲؘَؙُؚِّْٗ٘ۡ.smallَ.smallࣱ.smallُ.smallࣰ.smallٌ.smallٗ.smallِ.smallٍ.smallْ.small2ِ.small2َ.small2ٗ.urd])",a=/[\u0615\u0617\u065C\u0670\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC\u06DD\u06DE\u06DF\u06E0\u06E2\u06E3\u06E4\u06E5\u06E6\u06E7\u06E8\u06E9\u06EA\u06EB\u06EC\u06ED\u0670.isol\u0670.medi\u06E5.medi\u06E6]/,r="([آإأءئؤاىو])",t=["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"],i=[{id:"alefHamzas",replace:/[أإآا]/g,"with":"[أإآا]"},{id:"alefMadda",replace:/آ|(?:ءا)/g,"with":"(?:آ|(?:ءا))"}],{getRegExp:function(e){return i.forEach(function(n){return e=e.replace(n.replace,n["with"])}),new RegExp("("+e+")","g")},Alphabet:{RegExp:e},Diacritics:{RegExp:new RegExp(n,"g"),String:n},Hamzas:{String:r,RegExp:new RegExp(r,"g")},Numbers:{Array:t},Quranic:{Sign:{RegExp:a}}}}]),app.service("CacheService",["$cacheFactory",function(e){return e("CacheService")}]),app.service("ContentService",["IDBStoreFactory","ExplanationFactory","AudioSrcFactory","Preferences","$q","$log",function(e,n,r,t,a){var i,o,u;return i=e("resources/quran.json",{dbVersion:10,storeName:"ayas",keyPath:"gid",autoIncrement:!1,indexes:[{name:"gid",unique:!0},{name:"page_id"},{name:"sura_id"},{name:"juz_id"},{name:"aya_id"}],transforms:[function(e){return 1===e.aya_id&&(e.sura_name=e[t.reader.sura_name]),e.text=function(){switch(!1){case!!t.reader.diacritics:return e.standard;case!(t.reader.standard_text&&t.reader.diacritics):return e.standard_full;default:return e.uthmani}}(),e},function(e){return t.explanations.enabled?a.all(t.explanations.ids.map(function(r){return n(r,e.gid)})).then(function(n){return e.explanations=n,e}):a.when(e)},function(e){return e.then(function(e){return t.audio.enabled?r(e.sura_id,e.aya_id).then(function(n){return e.recitation=n,e}):e})}]}),u=e("resources/quran.json",{dbVersion:3,storeName:"suras",keyPath:"sura_id",autoIncrement:!1,indexes:[{name:"sura_id",unique:!0}],transformResponse:function(e){return _.chain(e.data).uniq(!0,function(e){return e.sura_id}).map(function(e){return _.pick(e,"sura_id","gid","page_id","sura_name","sura_name_en","sura_name_romanization","standard","standard_full","uthmani")}).value()}}),o=e("resources/quran.json",{dbVersion:4,storeName:"juzs",keyPath:"juz_id",autoIncrement:!1,indexes:[{name:"juz_id",unique:!0}],transformResponse:function(e){return _.chain(e.data).uniq(!0,function(e){return e.juz_id}).map(function(e){return _.pick(e,"juz_id","gid","page_id","standard","standard_full","uthmani")}).value()}}),{juzs:o,suras:u,ayas:i}}]),app.service("ExplanationService",["IDBStoreFactory","$log",function(e,n){var r,t;return r=[],t=e("resources/translations.json",{dbVersion:3,storeName:"explanations",keyPath:"id",autoIncrement:!1,indexes:[{name:"id",unique:!0},{name:"country"},{name:"language"}]}),{properties:t,load:function(a){return r["trans:"+a]||(r["trans:"+a]=t.then(function(e){return e.findOne({id:a}).exec()}).then(function(n){return e("resources/translations/"+n.file,{transformResponse:function(e){return e.data.split(/\n/g).map(function(e,n){return{gid:n+1,text:e}})},dbVersion:n.version||1,storeName:a,keyPath:"gid",autoIncrement:!1,indexes:[{name:"gid",unique:!0}],transforms:[function(e){return _.extend(e,n)}]})}).then(function(e){return n.debug("Store ready for explanation "+a),e})["catch"](function(e){return n.error(e)}))}}}]),app.service("LocalizationService",function(){var e,n;return n=function(e){return e.replace(/@\w+/,"")},e=function(e,n){var r;return r=e.match(new RegExp(n,"g")),r?r.length:0},{isRTL:function(r){var t;return r=n(r),t=e(r,"[\\u060C-\\u06FE\\uFB50-\\uFEFC]"),100*t/r.length>20}}}),app.service("NavigationService",[function(){return{go:function(e){return{aya_id:e.match(/(?!aya\s*(\d+))|\d+\W(\d+)/gi)[1],page_id:e.match(/page\s*(\d+)/gi)[1],sura_id:e.match(/(?!surah*\s*(\d+))|(d+)\W\d+/gi)[1],sura_name:e.match(/surah*\s*(\D+)/gi)[1]}}}}]),app.service("Preferences",["$localStorage",function(e){var n;return n={first_time:!0,theme:"balanced",search:{history:[],max_history:10,online:{enabled:!1,prompt:!0}},explanations:{enabled:!0,ids:["ar.muyassar","en.ahmedali"]},nav:{view:{id:"sura_id"}},reader:{arabic_text:!0,standard_text:!1,diacritics:!0,view:{type:"page_id",current:1,total:604},colorized:!0,aya_mode:"uthmani",sura_name:"sura_name_romanization",sura_name_transliteration:!0},audio:{recitation:{subfolder:"Abdul_Basit_Murattal_64kbps",name:"Abdul Basit Murattal",bitrate:"64kbps"},auto_quality:!0,enabled:!0},connection:{bandwidth:1/0,auto:!0}},e.$default(n)}]),app.service("RecitationService",["IDBStoreFactory",function(e){var n;return n=e("resources/recitations.json",{dbVersion:1,storeName:"recitations",keyPath:"subfolder",autoIncrement:!1,indexes:[{name:"subfolder",unique:!0},{name:"name"},{name:"bitrate"}]}),{properties:n}}]),app.service("SearchService",["APIService","ContentService","ArabicService","Preferences","$log","$http","$q",function(e,n,r,t,a,i,o){var u,s,c,l;return u=void 0,c=function(){return u=i.get("resources/search.json",{cache:!0}).then(function(e){return e.data}).then(function(e){var n,r;return r=o.defer(),n=new Nedb,n.insert(e,function(e){if(e)throw e;return r.resolve(n)}),r.promise})},s=function(e){var r;return r=o.defer(),n.ayas.then(function(n){return async.mapLimit(e,10,function(e,r){return n.findOne({gid:e.gid}).exec().then(function(e){return r(null,e)})},function(n,t){if(n)throw n;return r.resolve(_.merge(e,t))})}),r.promise},l={},l.online=function(n){return a.debug("Searching online..."),e.query({action:"search",unit:"aya",traduction:1,query:n,sortedBy:"mushaf",word_info:"False",recitation:0,aya_position_info:"True",aya_sajda_info:"False",fuzzy:"True",script:"standard",vocalized:"True",range:"25",perpage:"25"}).then(function(e){var n;return a.debug("Online search response:",e),n=_(e.data.search.ayas).map(function(e,n){return{gid:e.identifier.gid,index:n}}).toArray().sortBy("index").value()})},l.offline=function(e,n){return(u||c()).then(function(t){var a,i,u,s;return a=o.defer(),n.srtictDiacritics?(s=new RegExp("[](?! "+r.Diacritics.String+")","g"),e=e.replace(s,0/0+r.Diacritics.String+")*"),n.field="standard_full"):e=e.replace(r.Diacritics.RegExp,""),n.ignoreHamzaCase&&(e=e.replace(r.Hamzas.RegExp,r.Hamzas.String)),e=e.replace(/\s{2,}/g," "),e=e.trim(),u=new RegExp(e,"gi"),i={},i[n.field]={$regex:u},t.find(i).sort({gid:1}).exec(function(e,n){if(e)throw e;return a.resolve(n)}),a.promise})},{search:function(e,n){var r;return null==n&&(n={}),n=_.defaults(n,{matches:"autocomplete",srtictDiacritics:!1,ignoreHamzaCase:!0,onlyStartAya:!1,wholeWord:!0,scope:"all",sort:[{sura_id:1},{aya_id:1}],limit:0,skip:0,field:"standard",online:t.search.online.enabled}),e?(r="offline",n.online&&(r="online"),l[r](e,n)["catch"](function(t){if("offline"!==r)return l.offline(e,n);throw t}).then(s).then(function(n){if(n.length)return _.pull(t.search.history,e),t.search.history.unshift(e),t.search.history=t.search.history.slice(0,t.search.max_history),n;throw"NO_RESULTS"})):o.reject("NO_QUERY")}}}]);