const dogs = [
  { name: "Mochi", officialName: "花宝", path: [], photo: "mochi.png" },
  { name: "Shuuka", officialName: "秋华", path: ["mother"], photo: "shuuka_mother.png" },
  { name: "Yokozuna", officialName: "横綱", path: ["father"], photo: "yokozuna_father.jpg" },
  { name: "Yukina", officialName: "雪菜", path: ["mother", "mother"], photo: "Yukina_mother_mother.jpg" },
  { name: "Tsunatora", officialName: "綱虎", path: ["mother", "father"], photo: "Tsunatora_mother_father.jpeg" },
  { name: "Yujo No Yuriko", officialName: "友情の百合子", path: ["father", "mother"], photo: "YujoNoYuriko_father_mother.png" },
  { name: "Tenzanryuu", officialName: "天山龙", path: ["father", "father"], photo: "tenzanryuu_father_father.jpeg" },
  { name: "Hibisawa", officialName: "华纯", path: ["mother", "mother", "mother"], photo: "Hibisawa_mother_mother_mother.jpg" },
  { name: "Hachidai", officialName: "八大", path: ["mother", "mother", "father"], photo: "Hachidai_mother_mother_father.jpg" },
  { name: "Naoko", officialName: "直子", path: ["mother", "father", "mother"], photo: "Naoko_mother_father_mother.jpg" },
  { name: "Tenshou", officialName: "天翔", path: ["mother", "father", "father"], photo: "tenshou_mother_father_father.jpg" },
  { name: "Mikumo", officialName: "美云", path: ["father", "mother", "mother"], photo: "mikumo_father_mother_mother.jpeg" },
  { name: "Kabutora", officialName: "歌舞虎", path: ["father", "mother", "father"], photo: "kabutora_father_mother_father.jpg" },
  { name: "Byakurenge", officialName: "白莲华", path: ["father", "father", "mother"], photo: "byakurenge_father_mother.jpg" },
  { name: "Monjiro", officialName: "纹次郎", path: ["father", "father", "father"], photo: "monjiro_father_father_father.jpeg" }
];

const generationNames = ["Mochi", "Parent", "Grandparent", "Great-grandparent"];
const rowStarts = {
  "": [1, 8],
  mother: [1, 4],
  father: [5, 4],
  mother_mother: [1, 2],
  mother_father: [3, 2],
  father_mother: [5, 2],
  father_father: [7, 2]
};

function pathKey(path) {
  return path.join("_");
}

function relationship(path) {
  if (!path.length) return "The heart of this family";
  const words = path.map((step) => step === "mother" ? "mother" : "father");
  return `Mochi's ${words.join("'s ")}`;
}

const chineseRelationshipNames = {
  "": "Mochi",
  mother: "妈妈",
  father: "爸爸",
  mother_mother: "外婆",
  mother_father: "外公",
  father_mother: "奶奶",
  father_father: "爷爷",
  mother_mother_mother: "外曾外祖母",
  mother_mother_father: "外曾外祖父",
  mother_father_mother: "外曾祖母",
  mother_father_father: "外曾祖父",
  father_mother_mother: "曾外祖母",
  father_mother_father: "曾外祖父",
  father_father_mother: "曾祖母",
  father_father_father: "曾祖父"
};

function chineseRelationship(path) {
  return chineseRelationshipNames[pathKey(path)];
}

function positionFor(path) {
  if (!path.length) return { column: 1, row: "4 / span 2" };
  if (path.length === 1) return { column: 2, row: path[0] === "mother" ? "2 / span 2" : "6 / span 2" };
  if (path.length === 2) {
    const row = { mother_mother: 1, mother_father: 3, father_mother: 5, father_father: 7 }[pathKey(path)];
    return { column: 3, row: `${row} / span 2` };
  }
  const binary = path.reduce((value, step) => value * 2 + (step === "father" ? 1 : 0), 0);
  return { column: 4, row: binary + 1 };
}

function drawConnectors(tree) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("connector-svg");
  svg.setAttribute("aria-hidden", "true");

  const width = 1160;
  const height = 708;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const columns = [190, 442, 764, 1160];
  const centersByDepth = [
    [354],
    [177, 531],
    [88.5, 265.5, 442.5, 619.5],
    [44.25, 132.75, 221.25, 309.75, 398.25, 486.75, 575.25, 663.75]
  ];

  for (let depth = 0; depth < 3; depth += 1) {
    centersByDepth[depth].forEach((parentY, parentIndex) => {
      [0, 1].forEach((childOffset) => {
        const childIndex = parentIndex * 2 + childOffset;
        const childY = centersByDepth[depth + 1][childIndex];
        const x1 = columns[depth];
        const x2 = columns[depth + 1] - 22;
        const mid = x1 + (x2 - x1) / 2;
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", `M ${x1} ${parentY} H ${mid} V ${childY} H ${x2}`);
        const firstBranch = childIndex < Math.pow(2, depth);
        path.classList.add(firstBranch ? "mother-line" : "father-line");
        svg.appendChild(path);
      });
    });
  }
  tree.appendChild(svg);
}

function renderTree() {
  const tree = document.querySelector("#familyTree");
  drawConnectors(tree);

  dogs.forEach((dog) => {
    const card = document.createElement("button");
    const position = positionFor(dog.path);
    const branch = dog.path[0] || "root";
    card.type = "button";
    card.className = `dog-card ${branch}-branch ${dog.path.length === 0 ? "root-card" : ""} ${dog.photo ? "" : "placeholder"}`;
    card.style.gridColumn = position.column;
    card.style.gridRow = position.row;
    card.dataset.path = pathKey(dog.path);
    card.disabled = !dog.photo;

    const photo = dog.photo
      ? `<img src="assets/${dog.photo}" alt="${dog.name}">`
      : `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 70'%3E%3Cpath fill='%238b857b' d='M40 55c-12 0-21-7-21-18 0-7 4-12 10-15-1-7 2-12 7-12 3 0 5 2 6 5 2-3 4-5 7-5 5 0 8 5 7 12 6 3 10 8 10 15 0 11-9 18-21 18h-5z'/%3E%3C/svg%3E" alt="">`;
    card.innerHTML = `${photo}<span class="dog-card-text"><strong>${dog.name} <span class="official-name">${dog.officialName}</span></strong><span class="kinship-name">${chineseRelationship(dog.path)}</span><small>${relationship(dog.path)}</small></span>`;

    if (dog.photo) card.addEventListener("click", () => openDogDetail(dog));
    tree.appendChild(card);
  });
}

const dogDialog = document.querySelector("#dogDialog");
function openDogDetail(dog) {
  document.querySelector("#dogDetailPhoto").src = `assets/${dog.photo}`;
  document.querySelector("#dogDetailPhoto").alt = dog.name;
  document.querySelector("#dogDetailName").innerHTML = `${dog.name} <span class="official-name">${dog.officialName}</span>`;
  document.querySelector("#dogDetailGeneration").textContent = generationNames[dog.path.length];
  document.querySelector("#dogDetailRelation").innerHTML = `<strong class="detail-kinship">${chineseRelationship(dog.path)}</strong><span>${relationship(dog.path)}</span>`;
  dogDialog.showModal();
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector("#familyTree").dataset.filter = button.dataset.filter;
  });
});
document.querySelector("#closeDog").addEventListener("click", () => dogDialog.close());
document.querySelector("#detailDone").addEventListener("click", () => dogDialog.close());

const memoryDialog = document.querySelector("#memoryDialog");
const memoryForm = document.querySelector("#memoryForm");
const photoInput = document.querySelector("#memoryPhoto");
const photoDrop = document.querySelector("#photoDrop");
const photoPreview = document.querySelector("#photoPreview");

document.querySelector("#openMemory").addEventListener("click", () => {
  document.querySelector("#memoryDate").valueAsDate = new Date();
  memoryDialog.showModal();
});
document.querySelector("#closeMemory").addEventListener("click", () => memoryDialog.close());

[memoryDialog, dogDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;
  photoPreview.src = URL.createObjectURL(file);
  photoDrop.classList.add("has-photo");
});

function openMemoryDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("mochi-story", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("memories", { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getMemories() {
  const db = await openMemoryDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction("memories").objectStore("memories").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addMemory(memory) {
  const db = await openMemoryDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction("memories", "readwrite").objectStore("memories").add(memory);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteMemory(id) {
  const db = await openMemoryDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction("memories", "readwrite").objectStore("memories").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return {
    month: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date),
    day: new Intl.DateTimeFormat("en", { day: "numeric" }).format(date)
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

async function renderMemories() {
  document.querySelectorAll(".memory-card.user-memory").forEach((card) => card.remove());
  const memories = await getMemories();
  memories.sort((a, b) => new Date(b.date) - new Date(a.date));
  const timeline = document.querySelector("#timelineList");

  memories.forEach((memory) => {
    const date = formatDate(memory.date);
    const card = document.createElement("article");
    card.className = "memory-card user-memory";
    const imageUrl = URL.createObjectURL(memory.photo);
    const safeTitle = escapeHtml(memory.title);
    const safeAge = escapeHtml(memory.age);
    const safeStory = escapeHtml(memory.story);
    card.innerHTML = `
      <div class="memory-date"><span>${date.month}</span><strong>${date.day}</strong></div>
      <img src="${imageUrl}" alt="${safeTitle}">
      <div class="memory-copy">
        <p class="memory-age">${safeAge}</p>
        <h3>${safeTitle}</h3>
        ${memory.story ? `<p>${safeStory}</p>` : ""}
        <button class="delete-memory" type="button">Remove memory</button>
      </div>`;
    card.querySelector(".delete-memory").addEventListener("click", async () => {
      if (!window.confirm(`Remove "${memory.title}" from Mochi's timeline?`)) return;
      await deleteMemory(memory.id);
      renderMemories();
    });
    timeline.appendChild(card);
  });
  document.querySelector("#emptyTimeline").hidden = memories.length > 0;
}

memoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = memoryForm.querySelector(".save-memory");
  submit.disabled = true;
  submit.textContent = "Saving…";

  await addMemory({
    date: document.querySelector("#memoryDate").value,
    age: document.querySelector("#memoryAge").value.trim(),
    title: document.querySelector("#memoryTitle").value.trim(),
    story: document.querySelector("#memoryStory").value.trim(),
    photo: photoInput.files[0]
  });

  await renderMemories();
  memoryForm.reset();
  photoDrop.classList.remove("has-photo");
  photoPreview.removeAttribute("src");
  submit.disabled = false;
  submit.textContent = "Save this memory";
  memoryDialog.close();
  document.querySelector("#timeline").scrollIntoView({ behavior: "smooth" });
});

const wallApiUrl = "https://kcbeashjvfwspyawbnrv.supabase.co/rest/v1/rpc";
const wallApiKey = "sb_publishable_B2bH12hTouOEifbf6yMhIQ_uq26cyS_";
const wallLock = document.querySelector("#wallLock");
const wallContent = document.querySelector("#wallContent");
const wallPasswordForm = document.querySelector("#wallPasswordForm");
const wallPasswordInput = document.querySelector("#wallPassword");
const wallPasswordError = document.querySelector("#wallPasswordError");
const wallUploadForm = document.querySelector("#wallUploadForm");
const wallPhotoInput = document.querySelector("#wallPhoto");
const wallPhotoPicker = document.querySelector("#wallPhotoPicker");
const wallPhotoPreview = document.querySelector("#wallPhotoPreview");
const wallUploadStatus = document.querySelector("#wallUploadStatus");
const photoWall = document.querySelector("#photoWall");
const wallLoading = document.querySelector("#wallLoading");
const wallEmpty = document.querySelector("#wallEmpty");
let wallPassword = sessionStorage.getItem("mochi-wall-password") || "";

async function callWallApi(functionName, body) {
  const response = await fetch(`${wallApiUrl}/${functionName}`, {
    method: "POST",
    headers: {
      apikey: wallApiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "wall_request_failed");
  }
  return response.json();
}

function renderWallPhotos(photos) {
  photoWall.replaceChildren();
  photos.forEach((photo) => {
    const card = document.createElement("figure");
    card.className = "wall-photo-card";

    const image = document.createElement("img");
    image.src = photo.image_data;
    image.alt = photo.caption || `${photo.relationship} with Mochi`;

    const details = document.createElement("figcaption");
    const relationship = document.createElement("strong");
    relationship.textContent = photo.relationship;
    details.appendChild(relationship);

    if (photo.caption) {
      const caption = document.createElement("p");
      caption.textContent = photo.caption;
      details.appendChild(caption);
    }

    const date = document.createElement("time");
    date.dateTime = photo.created_at;
    date.textContent = new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(new Date(photo.created_at));
    details.appendChild(date);

    card.append(image, details);
    photoWall.appendChild(card);
  });
  wallEmpty.hidden = photos.length > 0;
}

async function unlockWall(password) {
  wallLoading.hidden = false;
  wallPasswordError.textContent = "";
  try {
    const photos = await callWallApi("mochi_wall_list", { p_password: password });
    wallPassword = password;
    sessionStorage.setItem("mochi-wall-password", password);
    wallLock.hidden = true;
    wallContent.hidden = false;
    renderWallPhotos(photos);
    return true;
  } catch (error) {
    if (error.message === "invalid_access") {
      wallPasswordError.textContent = "That password does not open Mochi's wall.";
    } else {
      wallPasswordError.textContent = "The wall could not be opened. Please try again.";
    }
    sessionStorage.removeItem("mochi-wall-password");
    wallPassword = "";
    return false;
  } finally {
    wallLoading.hidden = true;
  }
}

function resetWallUpload() {
  wallUploadForm.reset();
  wallPhotoPicker.classList.remove("has-photo");
  wallPhotoPreview.removeAttribute("src");
  wallUploadStatus.textContent = "";
}

function resizeWallPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(source);
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("image_load_failed"));
    };
    image.src = source;
  });
}

wallPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = wallPasswordForm.querySelector("button");
  button.disabled = true;
  button.textContent = "Opening…";
  await unlockWall(wallPasswordInput.value);
  button.disabled = false;
  button.textContent = "Unlock the wall";
});

document.querySelector("#showWallUpload").addEventListener("click", () => {
  wallUploadForm.hidden = false;
  wallUploadForm.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.querySelector("#hideWallUpload").addEventListener("click", () => {
  wallUploadForm.hidden = true;
  resetWallUpload();
});
document.querySelector("#lockWall").addEventListener("click", () => {
  sessionStorage.removeItem("mochi-wall-password");
  wallPassword = "";
  wallContent.hidden = true;
  wallLock.hidden = false;
  wallPasswordInput.value = "";
  resetWallUpload();
});

wallPhotoInput.addEventListener("change", () => {
  const file = wallPhotoInput.files[0];
  if (!file) return;
  wallPhotoPreview.src = URL.createObjectURL(file);
  wallPhotoPicker.classList.add("has-photo");
});

wallUploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const relationship = document.querySelector("#wallRelationship").value.trim();
  const caption = document.querySelector("#wallCaption").value.trim();
  const file = wallPhotoInput.files[0];
  const button = wallUploadForm.querySelector(".wall-submit-button");
  if (!relationship || !file) return;

  button.disabled = true;
  button.textContent = "Preparing photo…";
  wallUploadStatus.textContent = "Resizing your picture for the shared wall.";

  try {
    const imageData = await resizeWallPhoto(file);
    if (imageData.length > 1950000) throw new Error("image_too_large");
    button.textContent = "Uploading…";
    await callWallApi("mochi_wall_upload", {
      p_password: wallPassword,
      p_relationship: relationship,
      p_caption: caption,
      p_image_data: imageData
    });
    wallUploadStatus.textContent = "Your moment is now part of Mochi's wall.";
    resetWallUpload();
    wallUploadForm.hidden = true;
    await unlockWall(wallPassword);
  } catch (error) {
    wallUploadStatus.textContent = error.message === "image_too_large"
      ? "This image is still too large. Please choose a smaller photo."
      : "The photo could not be uploaded. Please try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Add to Mochi's wall";
  }
});

if (wallPassword) unlockWall(wallPassword);

renderTree();
renderMemories();
