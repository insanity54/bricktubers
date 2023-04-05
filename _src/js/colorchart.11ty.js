class Colorchart {
  data() {
    return {
      permalink: '/js/colorchart.js'
    }
  }
  render ({ scranclan }) {
    const js = `
console.log('chart!')
console.log([${scranclan.colors}])
    `
    return js
  }
}

module.exports = Colorchart