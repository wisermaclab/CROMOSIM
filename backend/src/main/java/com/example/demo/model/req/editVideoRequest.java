package com.example.demo.model.req;

import lombok.Data;
import net.sf.oval.constraint.Min;

@Data
public class editVideoRequest {
    @Min(value = 0, message = "start time can not be negative")
    private int start_time;
    @Min(value = 0, message = "end time can not be negative")
    private int end_time;
    @Min(value = 0, message = "folder id can not be negative")
    private int folder_id;
}
