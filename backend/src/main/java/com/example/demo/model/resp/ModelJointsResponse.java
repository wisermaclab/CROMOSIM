package com.example.demo.model.resp;

import lombok.Data;

import java.util.List;

@Data
public class ModelJointsResponse {
    private List<Double> data;
    private int frame_n;

    public ModelJointsResponse(List<Double> data, int frame_n) {
        this.data = data;
        this.frame_n = frame_n;
    }
}
