// # Libs
// ## axios
const axios = require('axios');

// ## jsdom
const { JSDOM } = require("jsdom");

// ## Express.js
const express = require('express');
const app = express();
app.use(express.json());


// # Main Process
// ## Endpoints
app.get('/', (req, res) => {
  const {
    pageUrl,
    defaultImageUrl,
  } = req.query;

  console.log(pageUrl, defaultImageUrl);

  if(
    !pageUrl
    && !defaultImageUrl
  ) {
    return res.status(400).send({
      message: 'Eather `pageUrl` or `defaultImageUrl` is required.',
    });
  }

  if(
    !pageUrl
  ) {
    return res.redirect(301, defaultImageUrl);
  }

  return axios.get(
    pageUrl,
  ).then(resp => {
    const html = resp.data;
    const dom = new JSDOM(html);

    const firstImgElement = dom.window.document.querySelector('.blog-posts img');
    if(
      !firstImgElement
      && !defaultImageUrl
    ) {
      return res.status(500).send({
        message: 'Server could not find image element in the entry.',
      });
    }
    else if(!firstImgElement) {
      return res.redirect(302, defaultImageUrl);
    }
    
    const firstImgSrc = firstImgElement.src;

    if(
      !firstImgSrc
      && !defaultImageUrl
    ) {
      return res.status(500).send({
        message: 'Server could not get the source url of the first image element.',
      });
    }
    else if(!firstImgSrc) {
      return res.redirect(302, defaultImageUrl);
    }

    return res.redirect(302, firstImgSrc);
  }).catch(err => {
    console.error(err.message);

    if(!defaultImageUrl) {
      res.status(500).send({
        message: 'Server could not get the entry.',
      });
    }
    else {
      return res.redirect(302, defaultImageUrl);
    }
  });

    
});

// ## Start Server
app.listen(process.env.PORT || 80);

