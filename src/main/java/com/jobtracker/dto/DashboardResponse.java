package com.jobtracker.dto;

public class DashboardResponse {

    private long totalApplications;
    private long applied;
    private long onlineAssessments;
    private long interviews;
    private long selected;
    private long rejected;

    public DashboardResponse(
            long totalApplications,
            long applied,
            long onlineAssessments,
            long interviews,
            long selected,
            long rejected) {

        this.totalApplications = totalApplications;
        this.applied = applied;
        this.onlineAssessments = onlineAssessments;
        this.interviews = interviews;
        this.selected = selected;
        this.rejected = rejected;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public long getApplied() {
        return applied;
    }

    public long getOnlineAssessments() {
        return onlineAssessments;
    }

    public long getInterviews() {
        return interviews;
    }

    public long getSelected() {
        return selected;
    }

    public long getRejected() {
        return rejected;
    }
}