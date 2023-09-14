package com.example.demo.model.resp;

import lombok.Data;

import java.util.List;

@Data
public class ModelPointsResponse {
    private List<Double> data;
    private int frame_n;

    public ModelPointsResponse(List<Double> data, int frame_n) {
        this.data = data;
        this.frame_n = frame_n;
    }
}
