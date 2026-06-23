Build a modern web application called **Mavin Campaign Operations Dashboard** for managing and tracking music marketing campaigns across multiple artists and releases.

The platform should feel like a combination of Notion, Airtable, Monday.com, and Spotify for Artists, with a clean dark mode interface, premium music-industry aesthetics, and responsive design.

## Objective

Create an internal campaign management system where marketing teams can:

* Track all campaign activities for artist releases
* View activities on a calendar
* Search historical campaigns
* Generate campaign reports automatically
* Monitor campaign progress and completion rates
* Manage multiple artists and releases from one dashboard

## Artists

Include the following artists as sample data:

* Ayra Starr
* Bayanni
* Boy Spyce
* CupidSZN
* Johnny Drille
* LADIPOE
* Lovn
* Magixx
* Rema

---

## Main Navigation

Sidebar Navigation:

1. Dashboard
2. Calendar
3. Artists
4. Releases
5. Activities
6. Reports
7. Search
8. Settings

---

## Dashboard Homepage

Display:

### KPI Cards

* Total Artists
* Active Campaigns
* Upcoming Activities
* Completed Activities
* Pending Activities
* Cancelled Activities

### Campaign Performance

Charts showing:

* Activities completed by month
* Activities by artist
* Activities by campaign type
* Completion percentage

### Upcoming Activities

Table displaying:

* Date
* Artist
* Song
* Activity
* Status

### Recent Campaigns

Cards displaying:

* Artist photo
* Release title
* Release date
* Progress percentage
* Campaign status

---

## Calendar Page

Create a full-page marketing calendar.

Views:

* Month View
* Week View
* Day View
* Timeline View

Display activities as color-coded events.

Status Colors:

* Green = Completed
* Yellow = In Progress
* Blue = Scheduled
* Red = Cancelled

Calendar events should display:

* Artist Name
* Release Name
* Activity Title

Clicking an event should open a detailed activity drawer.

---

## Artists Page

Display all artists in card format.

Each card should include:

* Artist image
* Artist name
* Number of releases
* Number of active campaigns
* Completion rate

Clicking an artist opens Artist Profile.

---

## Artist Profile Page

Example:

Artist: Magixx

Display:

### Overview

* Total Releases
* Total Activities
* Active Campaigns
* Completion Percentage

### Releases

List all releases associated with the artist.

### Campaign History

Timeline view of previous campaigns.

### Analytics

Graphs showing:

* Activity volume
* Campaign success rate
* Creator collaborations
* DSP placements

---

## Releases Page

Table View:

Columns:

* Release Name
* Artist
* Release Date
* Total Activities
* Completed
* Pending
* Status

Include filtering by:

* Artist
* Date
* Campaign Status

---

## Release Detail Page

Example:

Magixx – Juice & Liquor

Display:

### Campaign Overview

* Release Name
* Artist
* Release Date
* Campaign Owner
* Completion Rate

### Campaign Progress Bar

Visual progress indicator.

### Activity Sections

Pre-Release

Release Weekend

Post-Release

Each section should contain activities displayed as cards.

Activity card fields:

* Activity Title
* Description
* Date
* Owner
* Status
* Links
* Notes

---

## Activity Management

Create a modal form called:

Add New Activity

Fields:

* Artist
* Release
* Activity Name
* Activity Type
* Activity Description
* Campaign Stage
* Activity Date
* Owner
* Status
* External Link
* Notes

Status Options:

* Scheduled
* In Progress
* Completed
* Cancelled

Campaign Stages:

* Pre-Release
* Release Week
* Post-Release

Activity Types:

* DSP Placement
* Creator Campaign
* Social Media
* Influencer
* Media Interview
* Radio
* TV
* Ad Campaign
* Event
* Livestream
* Photoshoot
* Music Video
* Editorial
* Partnership
* Other

---

## Search Page

Global search bar.

Users should be able to search:

* Artist names
* Release titles
* Activity names
* Creators
* Media outlets
* Campaign notes

Display results grouped by category.

---

## Reports Page

Generate automated campaign recap reports.

Example output:

Artist: Magixx

Release: Juice & Liquor

Pre-Release Activities

Completed:
✓ DSP Editorial Placements
✓ Apple Music Big 5
✓ Editorial Photoshoot

Release Weekend

✓ TikTok Live
✓ Pappi Reacts
✓ Stationhead Streaming Party

Post Release

⚠ Genovevah Umeh Short Film

✗ ISWIS Podcast

Campaign Completion:
82%

Include:

* Export to PDF
* Export to Excel
* Export to PowerPoint

---

## AI Campaign Import Feature

Create a feature called:

"Paste Campaign Notes"

User pastes raw campaign text.

Example:

Magixx ‘Juice and Liquor’ Marketing Release Timeline

✓ DSP Editorial Placements
✓ Apple Music Big 5
✓ Digital Ad Campaigns

The AI automatically extracts:

* Artist
* Release Name
* Activity Name
* Dates
* Status
* Campaign Stage

Then automatically creates campaign records.

Show extraction preview before importing.

---

## Database Structure

Artists

* id
* name
* image
* bio

Releases

* id
* artist_id
* title
* release_date
* artwork
* description

Activities

* id
* release_id
* title
* description
* type
* stage
* status
* date
* owner
* notes
* external_link

Reports

* id
* release_id
* generated_date
* completion_rate

---

## Design Style

Premium music industry software.

Inspired by:

* Spotify for Artists
* Notion
* Linear
* Monday.com
* Airtable

Use:

* Dark theme
* Glassmorphism cards
* Smooth animations
* Modern typography
* Professional dashboard layouts
* Responsive desktop and mobile design

Include realistic sample campaign data for Ayra Starr, Magixx, Bayanni, and Rema so the prototype looks fully functional.
