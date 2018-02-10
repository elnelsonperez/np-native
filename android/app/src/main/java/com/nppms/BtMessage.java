package com.nppms;

import javax.annotation.Nullable;
import java.util.Map;

class BtMessage {

    private Double corr_id;
    private String type;
    private Map<String,Object> payload;

    public Double getCorr_id() {
        return corr_id;
    }

    public void setCorr_id(Double corr_id) {
        this.corr_id = corr_id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }
}