var indexedDB = window.indexedDB || window.mozIndexedDB || window.msIndexedDB || window.webkitIndexedDB;

if (indexedDB) {
    var app = {};
    app.indexedDB = {};
    app.indexedDB.db = null;
} else {
    alert("Can't use IndexedDB");
}
            
app.indexedDB.open = function () {
                
    var version = 1;
    var openRequest = indexedDB.open("DictionaryDatabase", version);


    openRequest.onupgradeneeded = function (e) {
        try {
            app.indexedDB.db = e.target.result;

            var store = app.indexedDB.db.createObjectStore("dictionary_data", { keyPath: "name", autoIncrement: true });
            store.createIndex("name", "name", { unique: true });
            store.createIndex("initial", "initial", { unique: false });
            store.createIndex("lexical_category", "lexical_category", { unique: false, autoIncrement: true });
            store.createIndex("category", "category", { unique: false, autoIncrement: true });
            store.createIndex("position", "position", { unique: false, autoIncrement: true });
            store.createIndex("handshape", "handshape", { unique: false, autoIncrement: true });
            store.createIndex("related_word0", "related_word0", { unique: false, autoIncrement: true });
            store.createIndex("related_word1", "related_word1", { unique: false, autoIncrement: true });
            store.createIndex("picture", "picture", { unique: true, autoIncrement: true });
            store.createIndex("movie", "movie", { unique: true, autoIncrement: true });
        } catch (event) {alert("ERROR!"); }
    };
                
    openRequest.onsuccess = function (e) {
        app.indexedDB.db = e.target.result;
    };
                
    openRequest.onerror = function (e) {
        alert("onerror");
    };

    openRequest.onblocked = function (e) {
        alert("onblocked");
    };

};

// Displaying list
app.indexedDB.createList = function () {
    var datas = document.getElementById("datas");
    var i;
    
    for (i = datas.childNodes.length - 1; i >= 0; i--) {
        datas.removeChild(datas.childNodes[i]);
    }
                
    var db = app.indexedDB.db;
    var trans = db.transaction("dictionary_data", "readwrite");
    var store = trans.objectStore("dictionary_data");
                    
    var cursorRequest = store.openCursor();
    
    cursorRequest.onsuccess = function (e) {
        var cur = e.target.result;        
        if (!cur) { return; }
        var val = cur.value;
        var tr = document.createElement("tr");
        var td0 = document.createElement("td0");
        td0.innerHTML = val.name;
        tr.appendChild(td0);
        var td1 = document.createElement("td1");
        td1.innerHTML = val.initial;
        tr.appendChild(td1);
        var td2 = document.createElement("td2");
        td2.innerHTML = val.lexical_category;
        tr.appendChild(td2);
        var td3 = document.createElement("td3");
        td3.innerHTML = val.category;
        tr.appendChild(td3);     
        datas.appendChild(tr);
        cur.continue();
    };
};

// Adding data from .json file
app.indexedDB.addData_from_file = function () {

    var httpObj = new XMLHttpRequest();
    httpObj.open("get", "dictionary_data/dictionary_data.json", true);    
    httpObj.send(null);
    
    httpObj.onreadystatechange = function () {
        if (httpObj.readyState == 4 && httpObj.status == 200)
        {
            var data = JSON.parse(httpObj.responseText);
            var i;
            var db = app.indexedDB.db;

            for(i = 0; i < data.length; i++){
                var trans = db.transaction("dictionary_data", "readwrite");
                var store = trans.objectStore("dictionary_data");
                store.put(data[i]);
            }
/* Debug for indexedDB
            app.indexedDB.createList();
*/            
            alert('Database generated');

        }
    };
    
};

app.indexedDB.getList = function (INITIAL) {
    var version = 1;
    var openRequest = indexedDB.open("DictionaryDatabase", version);

    openRequest.onsuccess = function (e) {
        var wordInitial = document.getElementById("wordInitial");
        var wordList = document.getElementById("wordList");
        var i;
        
        for (i = wordInitial.childNodes.length - 1; i >= 0; i--) {
            wordInitial.removeChild(wordInitial.childNodes[i]);
        }
    
        var ini = document.createElement("ini");
        ini.innerHTML = INITIAL;
        wordInitial.appendChild(ini);    
    
        for (i = wordList.childNodes.length - 1; i >= 0; i--) {
            wordList.removeChild(wordList.childNodes[i]);
        }
    
        var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;
        var db = e.target.result;
        var trans = db.transaction("dictionary_data", "readwrite");
        var store = trans.objectStore("dictionary_data");
        var range = IDBKeyRange.bound(INITIAL, INITIAL);
        var cursorRequest = store.index("initial").openCursor(range);
    
        cursorRequest.onsuccess = function (e) {
            var cursor = this.result;        
            if (cursor) {
                var val = cursor.value;
                var tr = document.createElement("tr");
                tr.setAttribute('data-href', "dictionary_word.html?" + val.name);                
                var td0 = document.createElement("td0");
                td0.innerHTML = val.name;
                tr.appendChild(td0);
                wordList.appendChild(tr);                
                putLinkOnTable();
                cursor.continue();
            }
        };
    };
};

app.indexedDB.searchWord = function () {
    var SEARCHWORD = document.search.SEARCHWORD.value;
    var searchWord = document.getElementById("searchWord");
    var i;
    
    for (i = searchWord.childNodes.length - 1; i >= 0; i--) {
        searchWord.removeChild(searchWord.childNodes[i]);
    }
    if(SEARCHWORD == "") return;
    
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;
    var db = app.indexedDB.db;
    var trans = db.transaction("dictionary_data", "readwrite");
    var store = trans.objectStore("dictionary_data");
    var cursorRequest = store.openCursor();    

    cursorRequest.onsuccess = function (e) {
        var cursor = this.result;
                
        if (!cursor) { return; }
        var val = cursor.value;
        var str = " " + val.name.toLowerCase();
        if (str.indexOf(" " + SEARCHWORD.toLowerCase()) !== -1) {
            var tr = document.createElement("tr");
            tr.setAttribute('data-href', "dictionary_word.html?" + val.name);
            var td0 = document.createElement("td0");
            td0.innerHTML = val.name;
            console.log(val.name);
            tr.appendChild(td0);
            searchWord.appendChild(tr);
            putLinkOnTable();
        }
        cursor.continue();
    };
};

function putLinkOnTable (){
  $('tr[data-href]').addClass('clickable')
    .click(function(e) {
      if(!$(e.target).is('a')){
        window.location = $(e.target).closest('tr').data('href');
      };
  });
};

app.indexedDB.getWord = function (WORD) {
    var version = 1;
    var openRequest = indexedDB.open("DictionaryDatabase", version);

    openRequest.onsuccess = function (e) {
        var wordName = document.getElementById("wordName");
        var wordLexicalCategory = document.getElementById("wordLexicalCategory");
        var wordCategory = document.getElementById("wordCategory");
        var wordRelated0 = document.getElementById("wordRelated0");
        var wordRelated1 = document.getElementById("wordRelated1");        
        var i;
        for (i = wordName.childNodes.length - 1; i >= 0; i--) {
            wordName.removeChild(wordName.childNodes[i]);
            wordLexicalCategory.removeChild(wordLexicalCategory.childNodes[i]);
            wordCategory.removeChild(wordCategory.childNodes[i]);
            wordRelated0.removeChild(wordRelated0.childNodes[i]);
            wordRelated1.removeChild(wordRelated1.childNodes[i]);
        }

        var db = e.target.result;
        var trans = db.transaction("dictionary_data", "readwrite");
        var store = trans.objectStore("dictionary_data");
        var cursorRequest = store.get(WORD);
    
        cursorRequest.onsuccess = function () {
            var result = this.result;
            var wname = document.createElement("wname");
            var wlexicalcategory = document.createElement("wlexicalcategory");
            var wcategory = document.createElement("wcategory");
            var wrelated0 = document.createElement("wrelated0");
            var wrelated1 = document.createElement("wrelated1");
            wrelated0.setAttribute('data-href', "dictionary_word.html?" + result.related_word0);
            wrelated1.setAttribute('data-href', "dictionary_word.html?" + result.related_word1);
            wname.innerHTML = result.name;
            wlexicalcategory.innerHTML = result.lexical_category;
            wcategory.innerHTML = result.category;
            wrelated0.innerHTML = result.related_word0;
            wrelated1.innerHTML = result.related_word1;
            wordName.appendChild(wname);
            wordLexicalCategory.appendChild(wlexicalcategory);
            wordCategory.appendChild(wcategory);
            wordRelated0.appendChild(wrelated0);
            wordRelated1.appendChild(wrelated1);
            document.getElementById("wordPicture").src = result.picture;
            document.getElementById("wordMovie").src = result.movie;
            putLinkOnRelatedWord();
        };
    };
};

function putLinkOnRelatedWord (){
  $('wrelated0[data-href]').addClass('clickable')
    .click(function(e) {
      if(!$(e.target).is('a')){
        window.location = $(e.target).closest('wrelated0').data('href');
      };
  });
  $('wrelated1[data-href]').addClass('clickable')
    .click(function(e) {
      if(!$(e.target).is('a')){
        window.location = $(e.target).closest('wrelated1').data('href');
      };
  });    
};

function initial() {

    if (indexedDB.open("DictionaryDatabase")) {
//        console.log("Delete database");
        indexedDB.deleteDatabase("DictionaryDatabase");
    }

    app.indexedDB.open();
}