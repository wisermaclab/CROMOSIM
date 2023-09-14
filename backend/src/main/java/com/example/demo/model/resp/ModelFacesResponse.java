package com.example.demo.model.resp;

import lombok.Data;

import java.util.List;

@Data
public class ModelFacesResponse {
    private List<List<Integer>> data;

    public ModelFacesResponse(List<List<Integer>> data) {
        this.data = data;
    }
}
