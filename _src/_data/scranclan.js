

require('dotenv').config()
const EleventyFetch = require("@11ty/eleventy-fetch");


module.exports = async function() {

  console.log('  >> getting scranclan data')
  const json = await EleventyFetch(`https://scranclan.grimtech.net/api/colors.json?key=${process.env.SCRANCLAN_KEY}`, {
    duration: '1m',
    type: 'json'
  })


  // Create an object to store the transformed data
  const transformedData = {
    "colors": []
  }


  // Loop through the original data and create a frequency count for each color on each date
  for (const item of json.colors) {
    const existingItem = transformedData.colors.find(d => d.date === item.date && d.color === item.color);
    if (existingItem) {
      existingItem.count++;
    } else {
      transformedData.colors.push({
        date: new Date(item.date).toISOString().split('T')[0],
        color: item.color,
        count: 1
      });
    }
  }

  return {
    colors: transformedData.colors,
    samples: []
  }
};