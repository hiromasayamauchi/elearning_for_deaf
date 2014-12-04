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
//                        alert("onupgradeneeded in initial");
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
//            store.createIndex("picture", "picture", { unique: true, autoIncrement: true });
//            store.createIndex("movie", "movie", { unique: true, autoIncrement: true });
                        
            e.target.transaction.oncomplete = function () {
                app.indexedDB.createList();
            };

        } catch (event) {alert("ERROR!"); }
    };
                
    openRequest.onsuccess = function (e) {
//        alert("onsuccess");
        app.indexedDB.db = e.target.result;
        app.indexedDB.createList();
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
//                alert("createList");
                
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
    
    httpObj.onload = function (){
        var db = app.indexedDB.db;
        var trans = db.transaction("dictionary_data", "readwrite");
        var store = trans.objectStore("dictionary_data");
        var i;
        var data = JSON.parse(this.responseText);
        for (i = 0; i < data.length; i++) {
            store.put(data[i]);
        }
    };
};

app.indexedDB.getWord = function () {
    var wordName = document.getElementById("wordName");
    var wordLexicalCategory = document.getElementById("wordLexicalCategory");
    var wordCategory = document.getElementById("wordCategory");
    var db = app.indexedDB.db;
    var trans = db.transaction("dictionary_data", "readwrite");
    var store = trans.objectStore("dictionary_data");
//    var index = store.index("name");
    var cursorRequest = store.get("Apple");
    
    cursorRequest.onsuccess = function () {
        var result = this.result;
        var wname = document.createElement("wname");
        var wlexicalcategory = document.createElement("wlexicalcategory");
        var wcategory = document.createElement("wcategory");
        wname.innerHTML = result.name;
        wlexicalcategory.innerHTML = result.lexical_category;
        wcategory.innerHTML = result.category;
        wordName.appendChild(wname);
        wordLexicalCategory.appendChild(wlexicalcategory);
        wordCategory.appendChild(wcategory);
    };
};

app.indexedDB.getList = function (INITIAL) {
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
    var db = app.indexedDB.db;
    var trans = db.transaction("dictionary_data", "readwrite");
    var store = trans.objectStore("dictionary_data");
    var range = IDBKeyRange.bound(INITIAL, INITIAL);
    var cursorRequest = store.index("initial").openCursor(range);
    
    cursorRequest.onsuccess = function (e) {
        var cursor = this.result;
        
        if (cursor) {
            var val = cursor.value;
            var tr = document.createElement("tr");
            var td0 = document.createElement("td0");
            td0.innerHTML = val.name;
            tr.appendChild(td0);
            wordList.appendChild(tr);
            cursor.continue();
        }
    };
};

app.indexedDB.searchWord = function () {
    var searchWindow = document.getElementById("searchWindow");
    var searchWord = document.getElementById("searchWord");
    var i;
        
    for (i = searchWord.childNodes.length - 1; i >= 0; i--) {
        searchWord.removeChild(wordList.childNodes[i]);
    }
    
    var search = "Apple";
    alert(search);
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;
    var db = app.indexedDB.db;
    var trans = db.transaction("dictionary_data", "readwrite");
    var store = trans.objectStore("dictionary_data");
    var range = IDBKeyRange.bound("A", "Z");
    var cursorRequest = store.index("name").openCursor(range);
        
    cursorRequest.onsuccess = function (e) {
        var cursor = this.result;
        
        if (cursor) {
            var val = cursor.value;
            var str = val.name + " ";
            if (str.indexOf(search + " ") !== -1) {
                var tr = document.createElement("tr");
                var td0 = document.createElement("td0");
                td0.innerHTML = val.name;
                tr.appendChild(td0);
                searchWord.appendChild(tr);
            }
            cursor.continue();
        }
    };
};



function initial() {
/*
    if (indexedDB.open("DictionaryDatabase")) {
        alert("Delete database");
        indexedDB.deleteDatabase("DictionaryDatabase");
    }
*/    
    app.indexedDB.open();
    app.indexedDB.addData_from_file();
    app.indexedDB.createList();
}

function getWord() {
    app.indexedDB.open();
//    app.indexedDB.getWord();
}