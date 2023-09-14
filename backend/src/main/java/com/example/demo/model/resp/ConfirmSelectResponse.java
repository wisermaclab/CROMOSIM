package com.example.demo.model.resp;

import lombok.Data;

import java.util.List;

@Data
public class ConfirmSelectResponse {
    private String data;

    public ConfirmSelectResponse(String data) {
        this.data = data;
    }
}
