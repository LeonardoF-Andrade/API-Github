export class GithubUser {
  static search(username) {
    const url = `https://api.github.com/users/${username}`;

    return fetch(url)
      .then((data) => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  async add(username) {
    try {
      const exists = this.entries.find((entry) => entry.login === username);
      if (exists) {
        throw new Error("Usuário já foi adicionado");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado");
      }

      this.entries = [user, ...this.entries]; //"...this.entries" é para continuar todos os outros usuarios que já estavam no array
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  save() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
  }
  // parse para transformar para objeto
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
  }

  delete(user) {
    const filtered = this.entries.filter((entry) => {
      return entry.login !== user.login;
    });
    this.entries = filtered;
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
    };
  }

  update() {
    this.removeAlltr();
    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOK = confirm("Deseja realmente remover?");
        if (isOK) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="" />
        <a href="">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">&times;</button>
      </td>
    `;

    return tr;
  }

  removeAlltr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
