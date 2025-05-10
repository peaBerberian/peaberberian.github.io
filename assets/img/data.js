const IMAGE_ROOT_PATH = "./assets/img/";
module.exports = {
  quickLinks: [
    {
      link: "https://github.com/peaBerberian",
      description: "Link to my GitHub account",
      img: IMAGE_ROOT_PATH + "github.png",
    },
    {
      link: "https://medium.com/@pea.berberian",
      description: "Link to my Medium page",
      img: IMAGE_ROOT_PATH + "medium.png",
    },
    {
      link: "https://www.linkedin.com/in/paul-berberian-6a685335/",
      description: "Link to my LinkedIn page",
      img: IMAGE_ROOT_PATH + "linkedin.png",
    },
  ],
  experiences: {
    canal: {
      image: IMAGE_ROOT_PATH + "canal.png",
      description: "Canal+",
    },
    davidson: {
      image: IMAGE_ROOT_PATH + "davidson2.png",
      description: "Davidson Consulting",

      languages: ["JavaScript", "Node.js", "Python", "Qml", "CoffeeScript"],

      libraries: {
        JavaScript: [
          "React.js",
          "Rx.js",
          "Flux",
          "Redux",
          "Backbone",
          "Mocha",
          "Chai",
          "Sinon",
          "Jasmine",
        ],
      },

      tools: ["Jenkins", "Docker", "Git", "GitHub", "WebPack", "Grunt", "Vim"],
    },

    orangeIPTV: {
      image: IMAGE_ROOT_PATH + "orange.png",
      description: "Orange",

      languages: ["PHP", "VBA", "Java", "JavaScript", "Node.JS"],

      libraries: {
        JavaScript: ["jquery", "socket.io"],

        tools: ["Android SDK", "Eclipse", "Vim"],
      },
    },

    orange: {
      image: IMAGE_ROOT_PATH + "orange.png",
      description: "Orange",
      languages: [],
      libraries: {},
    },
  },

  education: {
    esiee: {
      image: IMAGE_ROOT_PATH + "esiee2.png",
      description: "ESIEE",
    },

    xidian: {
      image: IMAGE_ROOT_PATH + "xidian2.png",
      description: "Xidian",
    },

    upec: {
      image: IMAGE_ROOT_PATH + "upec2.png",
      description: "UPEC",
    },
  },
};
