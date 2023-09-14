package com.example.demo.model.resp;

import lombok.Data;

import java.util.List;

@Data
public class ModelFrameResponse {
    private Integer frame;

    public ModelFrameResponse(Integer frame) {
        this.frame = frame;
    }
}
