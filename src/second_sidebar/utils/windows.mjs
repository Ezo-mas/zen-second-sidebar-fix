/**
 * @returns {boolean}
 */
export const isPopupWindow = () => {
  const mainWindow =
    document.getElementById("main-window") ?? document.documentElement;
  const chromeHidden = mainWindow?.getAttribute("chromehidden") ?? "";

  return (
<<<<<<< HEAD
    chromeHidden.split(/\s+/).includes("extrachrome") ||
    window.toolbar?.visible === false
=======
    !window.toolbar.visible ||
    mainWindow.hasAttribute("popup-window") ||
    (mainWindow.hasAttribute("chromehidden") &&
      mainWindow.getAttribute("chromehidden").includes("extrachrome"))
>>>>>>> upstream/master
  );
};
