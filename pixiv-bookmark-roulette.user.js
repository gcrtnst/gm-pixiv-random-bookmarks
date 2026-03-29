// ==UserScript==
// @name           Pixiv Bookmark Roulette
// @name:ja        Pixiv ブックマークガチャ
// @description    Opens a random illustration from your bookmarks.
// @description:ja ブックマークしたイラスト作品の中からランダムに1つ選んで表示します。
// @namespace      https://github.com/gcrtnst
// @version        0.2.0
// @author         gcrtnst
// @license        Unlicense
// @homepageURL    https://github.com/gcrtnst/gm-pixiv-bookmark-roulette
// @match          https://www.pixiv.net/*
// @noframes
// @grant          GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  async function main() {
    try {
      const userIdRes = await fetch("https://www.pixiv.net/bookmark.php");
      const userId = userIdRes.headers.get("x-user-id") || userIdRes.headers.get("x-userid");
      if (!userId) {
        alert("Failed to retrieve User ID. Please ensure you are logged in.");
        return;
      }

      const [showData, hideData] = await Promise.all([
        fetchBookmarkData(userId, "show", 0, 1),
        fetchBookmarkData(userId, "hide", 0, 1),
      ]);
      const totalShow = showData.body.total || 0;
      const totalHide = hideData.body.total || 0;
      const total = totalShow + totalHide;

      if (total === 0) {
        alert("No bookmarks found.");
        return;
      }

      const targetIndex = Math.floor(Math.random() * total);

      let targetRest = "show";
      let targetIndexInSet = targetIndex;
      if (targetIndex >= totalShow) {
        targetRest = "hide";
        targetIndexInSet = targetIndex - totalShow;
      }

      const targetPageData = await fetchBookmarkData(userId, targetRest, targetIndexInSet, 1);
      const selectedWork = targetPageData.body.works[0];
      location.href = `https://www.pixiv.net/artworks/${selectedWork.id}`;
    } catch (error) {
      console.error(error);
      alert("An unexpected exception occurred.");
    }
  }

  async function fetchBookmarkData(userId, rest, offset, limit) {
    const url = `https://www.pixiv.net/ajax/user/${userId}/illusts/bookmarks?tag=&offset=${offset}&limit=${limit}&rest=${rest}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`"GET ${url}" failed (${res.status})`);
    return await res.json();
  }

  function register() {
    const menuText = navigator.language.startsWith("ja")
      ? "ブックマークからランダムに開く"
      : "Open Random Bookmark";
    GM_registerMenuCommand(menuText, main);
  }

  register()
})();
