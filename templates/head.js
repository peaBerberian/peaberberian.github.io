module.exports = (wording) =>
  `<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="Description" content="Paul Berberian personal homepage">
  <title>${wording.title}</title>
  <style>
  body {
    margin: 1em auto;
    max-width: 40em;
    padding: 0 .62em;
    font-family: "Proxima Nova Regular", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 1.3em;
  }
  .quickLinks {
    margin-top: 17px;
  }
  .quicklink-link {
    margin: 7px;
  }
  .quicklink-img {
    width: 22px;
  }
  .title-name {
    font-size: 2.5em;
    margin-bottom: 0px;
  }
  .title-block {
    text-align: center;
    font-family: "Proxima Nova Regular", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .subtitle {
    font-size: 1.6em;
    font-style: italic;
    margin-top: 35px;
  }
  .main-container {
    line-height: 31px;
  }
  .page-title {
    margin-top: 70px;
    margin-bottom: 35px;
  }
  .asterisk {
    font-size: 0.8em;
    font-style: italic;
  }
  .separator {
    margin: 24px 0px;
    text-align: center;
    font-size: 1.5em;
  }
  .item-group {
    padding: 30px 10px;
  }
  .item-group-name {
    font-size: 1.3em;
  }
  .item-group-date {
    font-size: 0.9em;
    color: #333;
    font-style: italic;
  }
  .item-group-img {
    padding-right: 15px;
    float: left;
    max-height: 60px;
    max-width: 60px;
  }
  .item-group-loc {
    min-height: 38px;
  }
  .item-group-loc-desc {
    font-style: italic;
    font-size: 0.8em;
    margin-top: 0px;
  }
  .note-ref, .note-back {
    text-decoration: none;
  }
  </style>
  </head>
  `;

//border-bottom: 1px dashed #aaa;
