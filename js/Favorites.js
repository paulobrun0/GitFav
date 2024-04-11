import { GithubUser } from "./GithubSearch.js";

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);

    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(userName) {
    try {
      const userExists = this.entries.find((entry) => entry.login === userName);

      if (userExists) {
        throw new Error("Usuário já adicionado!");
      }

      const user = await GithubUser.search(userName);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
      this.update();
      this.root.querySelector(".search input").value = "";
    };
  }

  update() {
    if (this.entries.length === 0) {
      const backgroundInitial = document.querySelector(".background-initial");

      if (!backgroundInitial) {
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = `<tr class="background-initial"><td class="background-height">
          <div class="background">
            <img src="assets/imgs/Estrela.svg" alt="" />
            <h1>Nenhum favorito ainda</h1>
          </div>
        </td></tr>`;
      }
      return; // Retorna imediatamente se não houver entradas
    }

    this.removeAllTr();

    if (this.entries.length > 3) {
      const tbody = document.querySelector("table tbody");
      tbody.style.height = "340px";
    } else {
      const tbody = document.querySelector("table tbody");
      tbody.style.height = "auto";
    }

    console.log(this.entries.length);
    this.entries.forEach((user) => {
      const row = this.createRow();
      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = ` https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");
    const content = `
    <td class="user">
    <img
      src="https://avatars.githubusercontent.com/u/22562527?v=4"
      alt=""
    />
    <a href="https://github.com/paulobrun0" target="_blank">
      <p>Paulo Bruno</p>
      <span>/paulobrun0</span>
    </a>
  </td>
  <td class="repositories">100</td>
  <td class="followers">1000</td>
  <td><button class="remove">Remover</button></td>`;
    tr.innerHTML = content;
    return tr;
  }

  removeAllTr() {
    const tbody = this.root.querySelector("table tbody");
    tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
