import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Excel助手',
      submenu: [
        {
          label: '关于Excel助手',
          selector: 'orderFrontStandardAboutPanel:',
        },
        // {
        //   label: '联系邮箱：1779144713@qq.com',
        //   click() {
        //     const subject = encodeURIComponent("你好！关于“Excel助手”，我想咨询下");
        //     const body = encodeURIComponent("请在这里写下您想说的：")
        //     shell.openExternal(`mailto:1779144713@qq.com?subject=${subject}&body=${body}`);
        //   },
        // },
        { type: 'separator' },
        { label: '服务', submenu: [] },
        { type: 'separator' },
        {
          label: '隐藏Excel助手',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: '隐藏其他',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: '显示所有', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/main/docs#readme'
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    const templateDefault: any[] = [
      // {
      //   label: '文件',
      //   submenu: [
      //     // {
      //     //   label: '&Open',
      //     //   accelerator: 'Ctrl+O',
      //     // },
      //     {
      //       label: '退出程序',
      //       accelerator: 'Ctrl+W',
      //       click: () => {
      //         this.mainWindow.close();
      //       },
      //     },
      //   ],
      // },
      // {
      //   label: '窗口',
      //   submenu:
      //     process.env.NODE_ENV === 'development' ||
      //     process.env.DEBUG_PROD === 'true'
      //       ? [
      //           {
      //             label: '&Reload',
      //             accelerator: 'Ctrl+R',
      //             click: () => {
      //               this.mainWindow.webContents.reload();
      //             },
      //           },
      //           {
      //             label: 'Toggle &Full Screen',
      //             accelerator: 'F11',
      //             click: () => {
      //               this.mainWindow.setFullScreen(
      //                 !this.mainWindow.isFullScreen()
      //               );
      //             },
      //           },
      //           {
      //             label: 'Toggle &Developer Tools',
      //             accelerator: 'Alt+Ctrl+I',
      //             click: () => {
      //               this.mainWindow.webContents.toggleDevTools();
      //             },
      //           },
      //         ]
      //       : [
      //           {
      //             label: '切换全屏',
      //             accelerator: 'F11',
      //             click: () => {
      //               this.mainWindow.setFullScreen(
      //                 !this.mainWindow.isFullScreen()
      //               );
      //             },
      //           },
      //         ],
      // },
      // {
      //   label: '帮助',
      //   submenu: [
      //     // {
      //     //   label: 'Learn More',
      //     //   click() {
      //     //     shell.openExternal('https://electronjs.org');
      //     //   },
      //     // },
      //     {
      //       label: '联系邮箱：1779144713@qq.com',
      //       click() {
      //         const subject = encodeURIComponent("你好！关于“Excel助手”，我想咨询下");
      //         const body = encodeURIComponent("请在这里写下您想说的：")
      //         shell.openExternal(`mailto:1779144713@qq.com?subject=${subject}&body=${body}`);
      //       },
      //     },
      //   ],
      // },
    ];

    return templateDefault;
  }
}
