// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A growing collection of my cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-publications",
          title: "Publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-miscellaneous",
          title: "Miscellaneous",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/misc/";
          },
        },{id: "post-computer-networks-lab-2",
        
          title: "Computer Networks Lab 2",
        
        description: "计算机网络（春季）Lab 2 Solution",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/computer-networks-lab-2/";
          
        },
      },{id: "post-algebraic-structure-and-combinatorial-mathematics",
        
          title: "Algebraic Structure and Combinatorial Mathematics",
        
        description: "北京大学 代数结构与组合数学 笔记",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/algebra/";
          
        },
      },{id: "post-grade-standard",
        
          title: "Grade Standard",
        
        description: "北京大学大三第二学期课程考评标准",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/grade/";
          
        },
      },{id: "post-discrete-diffusion-models",
        
          title: "Discrete Diffusion Models",
        
        description: "MIT 6.S184 bonus",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/mit-6-s184/";
          
        },
      },{id: "post-mit-course-6-s184",
        
          title: "MIT Course 6.S184",
        
        description: "Course note",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/mit-6-s184/";
          
        },
      },{id: "post-计算机网络-春季-第二讲-物理层",
        
          title: "计算机网络（春季）第二讲：物理层",
        
        description: "计算机网络（春季）第二讲：物理层 课程笔记",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/computer-networks-physics/";
          
        },
      },{id: "post-computer-networks-lab-1",
        
          title: "Computer Networks Lab 1",
        
        description: "计算机网络（春季）Lab 1 Solution",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/computer-networks-lab-1/";
          
        },
      },{id: "post-computer-networks-lab-3",
        
          title: "Computer Networks Lab 3",
        
        description: "计算机网络（春季）Lab 3 Solution",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/computer-networks-lab-1-copy/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-just-created-my-personal-website",
          title: 'Just created my personal website 🎉',
          description: "",
          section: "News",},{id: "projects-game-ai",
          title: 'Game AI',
          description: "Play with my Othello &amp; Mahjong bot! 😂",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/example_pdf.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%6F%75@%65%78%61%6D%70%6C%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1010907", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qc6CJjYAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://www.alberteinstein.com/", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
