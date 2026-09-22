/**
 * @returns {boolean}
 */
export const isPopupWindow = () => {
  const mainWindow =
    document.getElementById("main-window") ?? document.documentElement;
  const chromeHidden = mainWindow?.getAttribute("chromehidden") ?? "";

  return (
    chromeHidden.split(/\s+/).includes("extrachrome") ||
    window.toolbar?.visible === false
  );
};
