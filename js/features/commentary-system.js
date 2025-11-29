// ========================================
// COMMENTARY SYSTEM (controller only now)
// ========================================

class CommentarySystem {
    constructor() {
        this.startAnnouncementDone = false;
        this.midRaceAnnouncementDone = false;
        this.winnerAnnouncementDone = false;
        this.finishAnnouncementDone = false;
		console.log("commentary has been loaded");
    }

    reset() {
        this.startAnnouncementDone = false;
        this.midRaceAnnouncementDone = false;
        this.winnerAnnouncementDone = false;
        this.finishAnnouncementDone = false;
    }
}

// Global instance
window.commentarySystem = new CommentarySystem();
