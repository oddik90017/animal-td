const baseAssetsPath = new URL("../../asets", import.meta.url).href;

export const assetManifest = {
  projectileVariants: [
    `${baseAssetsPath}/1/Vector/paint_arrow_right.svg`,
    `${baseAssetsPath}/1/Vector/paint_arrow_up.svg`,
    `${baseAssetsPath}/1/Vector/paint_arrow_down.svg`,
    `${baseAssetsPath}/1/Vector/paint_arrow_left.svg`,
    `${baseAssetsPath}/1/Vector/paint_splat_a.svg`,
    `${baseAssetsPath}/1/Vector/paint_splat_b.svg`,
    `${baseAssetsPath}/1/PNG/Default/paint_arrow_up.png`,
  ],
  enemies: [
    `${baseAssetsPath}/3/Vector/round.svg`,
    `${baseAssetsPath}/3/Vector/roundOutline.svg`,
    `${baseAssetsPath}/3/Vector/round_nodetails.svg`,
    `${baseAssetsPath}/3/Vector/round_nodetailsOutline.svg`,
    `${baseAssetsPath}/3/Vector/square.svg`,
    `${baseAssetsPath}/3/Vector/squareOutline.svg`,
    `${baseAssetsPath}/3/Vector/square_nodetails.svg`,
    `${baseAssetsPath}/3/Vector/square_nodetailsOutline.svg`,
  ],
  enemyPng: [
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_rabbit-017eca4f-9f5c-4248-ae66-698152db013a.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_walrus-9d0a1315-24bd-40a1-958b-cb98b38d7849.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_rhino-03935649-1a33-4db3-8f31-832a24c96131.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_zebra-78918cc9-6871-42d0-8f35-9205532b5867.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_sloth-bfaed315-8145-48ca-b528-5ff5c19fe0e7.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_elephant-0f00aa43-3298-4b5e-ac32-e5e1dcd4440d.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_hippo-f6a2c3ee-7612-4aad-8100-975f07648215.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_cow-5638310e-cfd8-4089-8c2d-d82c04d7fad3.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_goat-61863626-22c3-4ac3-8821-b0e681f5b467.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_frog-952fa1da-fbca-4af8-8f6b-531a657df67d.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_narwhal-c238146a-fe0b-40f7-b2e0-88e71edcf4c0.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_gorilla-66500585-531b-4255-809f-cbded746d276.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_moose-a5bdeb6d-08d6-4ecb-a017-588e22df5558.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_horse-3bd4eb62-7dbc-49dd-a4ba-c31fb60c595b.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_parrot-b4bf3284-a5d2-4d73-b2f0-b5c7e39b5fcc.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_duck-27ee7985-c787-4c27-8d36-ef429482edb8.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_giraffe-9f611c34-e213-4e95-ad77-e24488992dc2.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_snake-a6d40053-a90e-47ab-a688-9dfb07ce6eff.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_monkey-94063f38-fbb4-49d0-8f27-5876393c6cf3.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_owl-383444fc-7748-4473-a3d5-37a483be2864.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_panda-3cfebb35-74a1-4220-8097-d13e0431ac06.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_penguin-90b9e1ac-3cec-4d44-a265-95f15557496d.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_dog-1f5fd386-6d59-4d98-8bb1-e1dc873afe0e.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_crocodile-7a80c785-dc85-45c9-94a0-77d1a152598c.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_whale-6fa44fe4-01cc-4c2a-aa69-e34afb68f85b.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_pig-e36f5c7a-a59a-4e99-b046-bcdaf3e885f7.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_chicken-7aa73373-ffb7-4acf-bbc8-381f46158bd7.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_chick-c9cd1ccd-386f-4c11-b213-a92dc857173b.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_bear-c2047a43-5106-4b20-bf03-df79beb242c0.png`,
    `${baseAssetsPath}/enemies/c__Users_oddik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_buffalo-cc981758-9b8b-4760-b58c-ffb712c864bb.png`,
  ],
  backgrounds: [
    `${baseAssetsPath}/4/SpaceBackground/BackgroundGenerator/Space Background.png`,
    `${baseAssetsPath}/4/SpaceBackground/BackgroundGenerator/stars.png`,
  ],
  towers: [`${baseAssetsPath}/5/Planets/planet03.png`],
};

async function tryLoadImage(path) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ ok: true, image, path });
    image.onerror = () => resolve({ ok: false, image: null, path });
    image.src = path;
  });
}

export async function loadAssetBundle() {
  const imageEntries = [];

  const projectileLoads = await Promise.all(assetManifest.projectileVariants.map(tryLoadImage));
  const enemyLoads = await Promise.all(assetManifest.enemies.map(tryLoadImage));
  const enemyPngLoads = await Promise.all(assetManifest.enemyPng.map(tryLoadImage));
  const backgroundLoads = await Promise.all(assetManifest.backgrounds.map(tryLoadImage));
  const towerLoads = await Promise.all(assetManifest.towers.map(tryLoadImage));

  imageEntries.push(...projectileLoads.filter((x) => x.ok).map((x) => ({ key: x.path, image: x.image })));
  imageEntries.push(...enemyLoads.filter((x) => x.ok).map((x) => ({ key: x.path, image: x.image })));
  imageEntries.push(...enemyPngLoads.filter((x) => x.ok).map((x) => ({ key: x.path, image: x.image })));
  imageEntries.push(...backgroundLoads.filter((x) => x.ok).map((x) => ({ key: x.path, image: x.image })));
  imageEntries.push(...towerLoads.filter((x) => x.ok).map((x) => ({ key: x.path, image: x.image })));

  const imageMap = new Map(imageEntries.map((entry) => [entry.key, entry.image]));
  return {
    imageMap,
    loadedCount: imageMap.size,
    totalDeclared:
      assetManifest.projectileVariants.length +
      assetManifest.enemies.length +
      assetManifest.enemyPng.length +
      assetManifest.backgrounds.length +
      assetManifest.towers.length,
  };
}
