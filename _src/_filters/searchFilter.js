const elasticlunr = require("elasticlunr");

module.exports = function (collection) {
  // what fields we'd like our index to consist of
  var index = elasticlunr(function () {
    this.addField("name");
    this.addField("twitter");
    this.addField("date");
    this.setRef("name");
  });

  // loop through each page and add it to the index
  collection.forEach((bt, i) => {
    
    index.addDoc({
      id: i,
      name: bt.vtuberName,
      twitter: bt.vtuberTwitter,
      date: bt.date,
      slug: bt.vtuberSlug
    });
  });

  // console.log(index.toJSON())

  return index.toJSON();
};