<script setup>
import { defineOptions } from 'vue'
import { useTagPopup } from './useTagPopup'
import { DEVICE_STATE_ENUM } from '@/constants'

defineOptions({
  name: 'TagPopupContainer',
})

const {
  tagPopupVisible,
  tagPopupPosition,
  equipmentData,
  equipmentAlerts,
  alertCount,
  isError,
  getThresholdTip,
  close,
} = useTagPopup()
</script>

<template>
  <div
    v-show="tagPopupVisible"
    class="tag-popup"
    :class="{
      'tag-popup--normal': isError === DEVICE_STATE_ENUM.NORMAL,
      'tag-popup--error': isError === DEVICE_STATE_ENUM.ERROR,
    }"
    :style="{
      top: tagPopupPosition.top + 'px',
      left: tagPopupPosition.left + 'px',
    }"
  >
    <header class="tag-popup__header">
      <h3 class="tag-popup__title">设备运行监测</h3>
      <div
        v-show="isError === DEVICE_STATE_ENUM.ERROR"
        class="tag-popup__warning-icon"
      ></div>
      <span v-show="alertCount > 0" class="tag-popup__alert-count">
        {{ alertCount }}
      </span>
      <button
        class="tag-popup__close"
        @click="close"
        type="button"
        aria-label="关闭"
      ></button>
    </header>

    <div class="tag-popup__content">
      <div class="tag-popup__row">
        <div
          class="tag-popup__item"
          :class="{ 'item-alert': equipmentAlerts.ratedVoltage }"
        >
          <span>额定电压: </span>
          <span :class="{ 'alert-value': equipmentAlerts.ratedVoltage }">
            {{ equipmentData.ratedVoltage }}V
          </span>
          <div v-if="equipmentAlerts.ratedVoltage" class="threshold-tip">
            {{ getThresholdTip('ratedVoltage') }}
          </div>
        </div>
        <div
          class="tag-popup__item"
          :class="{ 'item-alert': equipmentAlerts.ratedCurrent }"
        >
          <span>额定电流: </span>
          <span :class="{ 'alert-value': equipmentAlerts.ratedCurrent }">
            {{ equipmentData.ratedCurrent }}A
          </span>
          <div v-if="equipmentAlerts.ratedCurrent" class="threshold-tip">
            {{ getThresholdTip('ratedCurrent') }}
          </div>
        </div>
      </div>
      <div class="tag-popup__row">
        <div
          class="tag-popup__item"
          :class="{ 'item-alert': equipmentAlerts.ratedPower }"
        >
          <span>额定功率: </span>
          <span :class="{ 'alert-value': equipmentAlerts.ratedPower }">
            {{ equipmentData.ratedPower }}kW
          </span>
          <div v-if="equipmentAlerts.ratedPower" class="threshold-tip">
            {{ getThresholdTip('ratedPower') }}
          </div>
        </div>
        <div
          class="tag-popup__item"
          :class="{ 'item-alert': equipmentAlerts.ratedFrequency }"
        >
          <span>额定频率: </span>
          <span :class="{ 'alert-value': equipmentAlerts.ratedFrequency }">
            {{ equipmentData.ratedFrequency }}Hz
          </span>
          <div v-if="equipmentAlerts.ratedFrequency" class="threshold-tip">
            {{ getThresholdTip('ratedFrequency') }}
          </div>
        </div>
      </div>
      <div class="tag-popup__row">
        <div
          class="tag-popup__item"
          :class="{ 'item-alert': equipmentAlerts.ratedSpeed }"
        >
          <span>额定转速: </span>
          <span :class="{ 'alert-value': equipmentAlerts.ratedSpeed }">
            {{ equipmentData.ratedSpeed }}r/min
          </span>
          <div v-if="equipmentAlerts.ratedSpeed" class="threshold-tip">
            {{ getThresholdTip('ratedSpeed') }}
          </div>
        </div>
        <div
          class="tag-popup__item"
          :class="{ 'item-alert': equipmentAlerts.mechanicalRatio }"
        >
          <span>机械转动比: </span>
          <span :class="{ 'alert-value': equipmentAlerts.mechanicalRatio }">
            {{ equipmentData.mechanicalRatio }}:1
          </span>
          <div v-if="equipmentAlerts.mechanicalRatio" class="threshold-tip">
            {{ getThresholdTip('mechanicalRatio') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import './variables.less';

.tag-popup {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  min-width: 335px;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  color: @tag-popup-text-color;
  padding-bottom: 10px;

  // 状态修饰符
  &--normal {
    background: url('@/assets/img/iot/green.png') no-repeat;
    background-size: 100% 100%;
  }

  &--error {
    background: url('@/assets/img/iot/red.png') no-repeat;
    background-size: 100% 100%;
  }

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    gap: @tag-popup-gap;
    padding: @tag-popup-header-padding;
  }

  &__title {
    margin: 0;
    font-size: @tag-popup-title-size;
    font-weight: bold;
    line-height: 1.4;
  }

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    width: @tag-popup-close-size;
    height: @tag-popup-close-size;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  &__warning-icon {
    width: @tag-popup-icon-size;
    height: @tag-popup-icon-size;
    background: url('@/assets/img/iot/warning.png') no-repeat;
    background-size: cover;
  }

  &__alert-count {
    width: @tag-popup-icon-size;
    height: @tag-popup-icon-size;
    border-radius: 50%;
    background-color: @tag-popup-alert-color;
    color: @tag-popup-alert-text-color;
    font-size: @tag-popup-small-font-size;
    font-weight: bold;
    display: inline-block;
    text-align: center;
    line-height: @tag-popup-icon-size;
  }

  // 内容区域
  &__content {
    display: flex;
    flex-direction: column;
    gap: @tag-popup-gap;
    padding: @tag-popup-content-padding;
    overflow-y: auto;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: @tag-popup-gap;
  }

  &__item {
    flex: 1;
    min-width: @tag-popup-item-min-width;
    padding: @tag-popup-item-padding;
    font-size: @tag-popup-font-size;
    line-height: @tag-popup-line-height;
    background: linear-gradient(
      90deg,
      @tag-popup-bg-gradient-start 0%,
      @tag-popup-bg-gradient-end 100%
    );

    // 数值样式
    span:last-child {
      margin-left: @tag-popup-text-spacing;
    }

    &.item-alert {
      box-shadow: 0 0 0 1px @tag-popup-alert-color;
      background: linear-gradient(
        90deg,
        @tag-popup-alert-bg-start 0%,
        @tag-popup-alert-bg-end 100%
      );
    }
  }
}

// 告警值样式
.alert-value {
  color: @tag-popup-alert-color;
  font-weight: bold;
  position: relative;
  animation: blink 1.5s infinite;
  text-align: center;

  &:after {
    content: '⚠️';
    font-size: @tag-popup-small-font-size;
    margin-left: @tag-popup-text-spacing;
  }
}

// 阈值提示
.threshold-tip {
  font-size: @tag-popup-small-font-size;
  color: @tag-popup-alert-color;
  margin-top: @tag-popup-threshold-margin;
  font-style: italic;
  padding: @tag-popup-threshold-padding;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
