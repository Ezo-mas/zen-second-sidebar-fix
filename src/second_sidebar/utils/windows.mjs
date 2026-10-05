/**
 * @returns {boolean}
 */
export const isPopupWindow = () => {
  const mainWindow =
    document.getElementById("main-window") ?? document.documentElement;
  const chromeHidden = mainWindow?.getAttribute("chromehidden") ?? "";

  return (
<<<<<<< HEAD
    window.toolbar?.visible === false ||
    mainWindow.hasAttribute("popup-window") ||
    chromeHidden.split(/\s+/).includes("extrachrome")
=======
    !window.toolbar.visible ||
    mainWindow.hasAttribute("popup-window") ||
    (mainWindow.hasAttribute("chromehidden") &&
      mainWindow.getAttribute("chromehidden").includes("extrachrome"))
>>>>>>> upstream/master
  );
};
