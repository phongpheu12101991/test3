// A.1

function flatarray(arr) {
  let newarray = arr.flat(Infinity);
  return newarray;
}

let arr1 = ["a", [["b"]]];
let arr2 = [1, [2], [3, [4]]];
let arr3 = [1, {}, ["b"]];
console.log(flatarray(arr1));
console.log(flatarray(arr2));
console.log(flatarray(arr3));

// A.2
let Grid1 = [
  [1, 3, 2, 5, 4, 6, 9, 8, 7],
  [4, 6, 5, 8, 7, 9, 3, 2, 1],
  [7, 9, 8, 2, 1, 3, 6, 5, 4],
  [9, 2, 1, 4, 3, 5, 8, 7, 6],
  [3, 5, 4, 7, 6, 8, 2, 1, 9],
  [6, 8, 7, 1, 9, 2, 5, 4, 3],
  [5, 7, 6, 9, 8, 1, 4, 3, 2],
  [2, 4, 3, 6, 5, 7, 1, 9, 8],
  [8, 1, 9, 3, 2, 4, 7, 6, 5],
];

let Grid2 = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
];

function sudokucheck(grid) {
  let check = true;
  for (let x = 0; x < 9; x++) {
    let newset = [...new Set(grid[x])];
    if (newset.length == 9) {
      check = true;
    } else {
      check = false;
      break;
    }
  }

  for (let y = 0; y < 9; y++) {
    let newarraycross = [];
    for (let z = 0; z < 9; z++) {
      newarraycross.push(grid[z][y]);
    }
    let newsetcross = [...new Set(newarraycross)];
    if (newsetcross.length == 9) {
      check = true;
    } else {
      check = false;
      break;
    }
  }

  return check;
}

console.log(sudokucheck(Grid1));
console.log(sudokucheck(Grid2));

// B.
let db = firebase.firestore();
let booklist = document.getElementById("booklist");

let all = document.getElementById("all");
let read = document.getElementById("read");
let unread = document.getElementById("unread");
let add = document.getElementById("add");
let namebook = document.getElementById("namebook");
let aubook = document.getElementById("aubook");
let imgbook = document.getElementById("imgbook");
let ok = document.getElementById("ok");
let error = document.getElementById("error");
let formadd = document.getElementById("formadd");

all.addEventListener("click", printall);
read.addEventListener("click", printread);
unread.addEventListener("click", printunread);
add.addEventListener("click", addbook);
ok.addEventListener("click", createbook);

function printread() {
  booklist.innerHTML = "<read-list></read-list>";
}

function printunread() {
  booklist.innerHTML = "<unread-list></unread-list>";
}

function printall() {
  booklist.innerHTML = "<read-list></read-list><unread-list></unread-list>";
}

function addbook() {
  if (formadd.style.visibility !== "hidden") {
    formadd.style.visibility = "hidden";
  } else if (formadd.style.visibility !== "visible") {
    formadd.style.visibility = "visible";
  }
  error.innerHTML = "";
}

function createbook() {
  if (namebook.value !== "" && aubook.value !== "" && imgbook.value !== "") {
    db.collection("checkname")
      .doc(`namebook`)
      .get()
      .then(function (doc) {
        if (doc.data().name.indexOf(namebook.value) == -1) {
          let newarrname = doc.data().name;
          newarrname.push(namebook.value);
          db.collection("checkname").doc(`namebook`).update({
            name: newarrname,
          });
          db.collection("unread").doc(`${namebook.value}`).set({
            name: namebook.value,
            author: aubook.value,
            img: imgbook.value,
          });
          error.innerHTML = "";
          formadd.style.visibility = "hidden";
        } else {
          error.innerHTML = "Tên sách trùng rồi";
        }
      });
  } else {
    error.innerHTML = "Tên, tác giả, hoặc ảnh sách không được để trống";
  }
}

class ReadList extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(
      document.getElementById("readlist").content.cloneNode(true)
    );
    this.$rlist = this._shadowRoot.querySelector("#rlist");
  }

  connectedCallback() {
    db.collection("Archive").onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        if (change.type === "added") {
          let item = document.createElement("book-item");

          item.setAttribute("name", data.name);
          item.setAttribute("img", data.img);
          item.setAttribute("author", data.author);
          item.setAttribute("check", "Đã đọc");

          this.$rlist.appendChild(item);
        }

        if (change.type === "removed") {
          this.$rlist.querySelector(`book-item[name='${data.name}']`).remove();
        }
      });
    });
  }
}
customElements.define("read-list", ReadList);

class UnreadList extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(
      document.getElementById("unreadlist").content.cloneNode(true)
    );
    this.$urlist = this._shadowRoot.querySelector("#urlist");
  }

  connectedCallback() {
    db.collection("unread").onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        if (change.type === "added") {
          let item = document.createElement("book-item");

          item.setAttribute("name", data.name);
          item.setAttribute("img", data.img);
          item.setAttribute("author", data.author);
          item.setAttribute("check", "Chưa đọc");

          this.$urlist.appendChild(item);
        }

        if (change.type === "removed") {
          this.$urlist.querySelector(`book-item[name='${data.name}']`).remove();
        }
      });
    });
  }
}
customElements.define("unread-list", UnreadList);

class BookItem extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(
      document.getElementById("bookitem").content.cloneNode(true)
    );
    this.$name = this._shadowRoot.querySelector("#name");
    this.$author = this._shadowRoot.querySelector("#author");
    this.$img = this._shadowRoot.querySelector("#img");
    this.$mark = this._shadowRoot.querySelector("#mark");
    this.$mark.addEventListener("click", () => {
      this.change();
    });
  }

  static get observedAttributes() {
    return ["name", "author", "img", "check"];
  }

  attributeChangedCallback() {
    this.render();
  }
  get name() {
    return this.getAttribute("name");
  }
  set name(newVal) {
    this.setAttribute("name", newVal);
  }

  get author() {
    return this.getAttribute("author");
  }
  set author(newVal) {
    this.setAttribute("author", newVal);
  }
  get img() {
    return this.getAttribute("img");
  }
  set img(newVal) {
    this.setAttribute("img", newVal);
  }
  get check() {
    return this.getAttribute("check");
  }
  set check(newVal) {
    this.setAttribute("check", newVal);
  }

  change() {
    console.log("aa");
    if (this.getAttribute("check") == "Chưa đọc") {
      db.collection("unread").doc(this.getAttribute("name")).delete();
      db.collection("Archive")
        .doc(this.getAttribute("name"))
        .set({
          name: this.getAttribute("name"),
          author: this.getAttribute("author"),
          img: this.getAttribute("img"),
        });
    }
    if (this.getAttribute("check") == "Đã đọc") {
      db.collection("Archive").doc(this.getAttribute("name")).delete();
      db.collection("unread")
        .doc(this.getAttribute("name"))
        .set({
          name: this.getAttribute("name"),
          author: this.getAttribute("author"),
          img: this.getAttribute("img"),
        });
    }
  }

  render() {
    this.$name.innerHTML = `Tên sách: ${this.getAttribute(
      "name"
    )} - ${this.getAttribute("check")}`;
    this.$author.innerHTML = `Tác giả: ${this.getAttribute("author")}`;
    this.$img.innerHTML = `<img src="${this.getAttribute(
      "img"
    )}" alt="" style="width: 40px; height: 40px"/>`;
  }
}
customElements.define("book-item", BookItem);
