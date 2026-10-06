/**
 * @returns {boolean}
 */
export const isPopupWindow = () => {
  const mainWindow =
    document.getElementById("main-window") ?? document.documentElement;
  const chromeHidden = mainWindow?.getAttribute("chromehidden") ?? "";

  return (
    window.toolbar?.visible === false ||
    mainWindow.hasAttribute("popup-window") ||
    chromeHidden.split(/\s+/).includes("extrachrome")
  );
};
