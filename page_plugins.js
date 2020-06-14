'use strict';

class PagePlugins {
  static STORAGE_KEY = 'page-plugins';
  static plugins = [];
  static storegPlugins = [];

  static async init() {
    const raw = localStorage.getItem(this.STORAGE_KEY);

    if (raw) {
      this.storedPlugins = JSON.parse(raw);
    } else {
      this.storedPlugins = await this.update();
    }

    this.storedPlugins.forEach((plugin) => {
      const func = Function(plugin.code);
      func();
    });

    this.render();
  }

  static async update() {
    const promises = this.plugins.map((plugin) => {
      return fetch(plugin.url)
        .then(response => response.text())
        .then(code => {
          plugin.code = code;
        })
    });

    await Promise.all(promises);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.plugins));
    return this.plugins;
  }

  static async save() {
    const element = document.getElementById('page-plugins');
    const value = element.value;

    this.plugins = value.split('\n').filter(url => { return url !== '' }).map(url => {
      return { url };
    });
    await this.update();
    await this.init();
  }

  static render() {
    const element = document.getElementById('page-plugins');
    const content = this.storedPlugins.map(p => p.url).join('\n')

    element.value = content;
  }

  static reset() {
    localStorage.clear();
    window.location.reload(true);
  }
}
