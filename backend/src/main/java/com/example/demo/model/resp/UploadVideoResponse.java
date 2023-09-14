package com.example.demo.model.resp;

import lombok.Data;

@Data
public class UploadVideoResponse {
    private Integer folderId;
    private String fileType;
    private long size;

    public UploadVideoResponse(Integer folderId, String fileType, long size) {
        this.folderId = folderId;
        this.fileType = fileType;
        this.size = size;
    }

    // Getters and Setters (Omitted for brevity)
}
