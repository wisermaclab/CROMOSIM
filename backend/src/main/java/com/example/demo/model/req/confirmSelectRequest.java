package com.example.demo.model.req;

import lombok.Data;
import net.sf.oval.constraint.Min;
import net.sf.oval.constraint.NotNull;

import java.util.List;

@Data
public class confirmSelectRequest {
    @NotNull(message = "selected list could not be empty")
    private String selected_list;
    @Min(value = 0, message = "folder id can not be negative")
    private int folder_id;
}
