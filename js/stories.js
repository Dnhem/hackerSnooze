"use strict";

/* Icons
** empty star **
<i class="far fa-star"></i>

** solid star **
<i class="fas fa-star"></i>

** trash can **
<i class="fas fa-trash-alt"></i>
*/

// This is the global list of the stories, an instance of StoryList
let storyList;
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/* Post new story on page */

async function postNewStory(evt) {
  evt.preventDefault();
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();
  const username = currentUser.username;
  const allInputs = { author, title, url, username };

  const addStory = await storyList.addStory(currentUser, allInputs);
  const newStory = generateStoryMarkup(addStory);
  $allStoriesList.prepend(newStory);

  $submitStoryForm.slideUp("fast");
  $submitStoryForm.trigger("reset");
}

$submitStoryForm.on("submit", postNewStory);

function renderOwnStories(story) {
  $ownStories.empty();

  $favoritedStories.hide();
  $allStoriesList.hide();
  $submitStoryForm.hide();
  $ownStories.show();

  if (currentUser.ownStories.length) {
    for (let story of currentUser.ownStories) {
      const ownStory = generateStoryMarkup(story);
      $ownStories.prepend(ownStory);
    }
  } else {
    $ownStories.prepend(`<h5>No stories!</h5>`);
  }
}

$("#mystories-link").on("click", renderOwnStories);
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/************************** Favorited Stories UI ******************************/

/* Display favorited stories on page */

function putFavoritesOnPage() {
  const userFavorites = currentUser.favorites;

  $favoritedStories.empty();
  $allStoriesList.hide();
  $favoritedStories.show();

  if (userFavorites.length === 0) {
    const notify = `<h5>No favorites added!</h5>`;
    $favoritedStories.append(notify);
  } else {
    for (let favorite of userFavorites) {
      const story = generateStoryMarkup(favorite);
      $favoritedStories.append(story);
    }
  }
  $submitStoryForm.hide();
  $ownStories.hide();
}

$("#favorites-link").on("click", putFavoritesOnPage);

/* Add to users favorites */

async function addToUserFavorites() {
  const $target = $(event.target);
  const $parentLi = $target.closest("li");
  const storyId = $parentLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($target.hasClass("fas")) {
    $target.toggleClass("fas", "far");
    await currentUser.removeFavorite(story);
  } else {
    $target.toggleClass("fas", "far");
    await currentUser.addFavorite(story);
  }
}

$allStoriesList.on("click", ".fa-star", addToUserFavorites);
