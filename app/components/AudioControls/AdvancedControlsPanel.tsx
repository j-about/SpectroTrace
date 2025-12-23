"use client";

/**
 * @fileoverview Advanced controls panel for audio conversion parameters.
 * Provides UI for duration, frequency range, sample rate, and other settings.
 * @module components/AudioControls/AdvancedControlsPanel
 */

import { useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ConversionParams,
  FrequencyScale,
  BrightnessCurve,
  SampleRate,
} from "@/lib/audio/types";
import {
  PARAM_RANGES,
  SAMPLE_RATES,
  DEFAULT_CONVERSION_PARAMS,
} from "@/lib/audio/types";

export interface AdvancedControlsPanelProps {
  params: ConversionParams;
  onParamsChange: (params: ConversionParams) => void;
  disabled?: boolean;
}

/**
 * Advanced controls panel for audio conversion parameters.
 *
 * Provides comprehensive UI controls for all SpectroTrace conversion settings:
 *
 * **Time & Frequency (Column 1):**
 * - Duration slider (1-30 seconds)
 * - Minimum/maximum frequency range
 * - Frequency scale (linear/logarithmic)
 *
 * **Audio Quality & Brightness (Column 2):**
 * - Sample rate selection (22050-96000 Hz)
 * - Smoothing percentage
 * - Brightness curve mapping
 * - Image inversion toggle
 *
 * @param props - Component props
 * @param props.params - Current conversion parameters state
 * @param props.onParamsChange - Callback when any parameter changes
 * @param props.disabled - If true, all controls are disabled (e.g., during generation)
 *
 * @example
 * ```tsx
 * <AdvancedControlsPanel
 *   params={conversionParams}
 *   onParamsChange={setConversionParams}
 *   disabled={isGenerating}
 * />
 * ```
 */
export function AdvancedControlsPanel({
  params,
  onParamsChange,
  disabled = false,
}: AdvancedControlsPanelProps) {
  const updateParam = useCallback(
    <K extends keyof ConversionParams>(key: K, value: ConversionParams[K]) => {
      onParamsChange({ ...params, [key]: value });
    },
    [params, onParamsChange],
  );

  const handleReset = useCallback(() => {
    onParamsChange(DEFAULT_CONVERSION_PARAMS);
  }, [onParamsChange]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Column 1: Time & Frequency */}
      <div className="space-y-4">
        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={disabled}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="duration-slider">Duration</Label>
            <span className="text-muted-foreground text-sm">
              {params.duration}s
            </span>
          </div>
          <Slider
            id="duration-slider"
            value={[params.duration]}
            min={PARAM_RANGES.duration.min}
            max={PARAM_RANGES.duration.max}
            step={1}
            disabled={disabled}
            onValueChange={([value]) => updateParam("duration", value)}
            aria-label="Duration in seconds"
          />
          <p className="text-muted-foreground text-xs">
            Length of generated audio ({PARAM_RANGES.duration.min}-
            {PARAM_RANGES.duration.max}s)
          </p>
        </div>

        {/* Frequency Range */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Frequency Range</legend>

          {/* Min Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="min-freq-slider">Min Frequency</Label>
              <span className="text-muted-foreground text-sm">
                {params.minFreq} Hz
              </span>
            </div>
            <Slider
              id="min-freq-slider"
              value={[params.minFreq]}
              min={PARAM_RANGES.minFreq.min}
              max={PARAM_RANGES.minFreq.max}
              step={10}
              disabled={disabled}
              onValueChange={([value]) => updateParam("minFreq", value)}
              aria-label="Minimum frequency in hertz"
            />
          </div>

          {/* Max Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-freq-slider">Max Frequency</Label>
              <span className="text-muted-foreground text-sm">
                {params.maxFreq} Hz
              </span>
            </div>
            <Slider
              id="max-freq-slider"
              value={[params.maxFreq]}
              min={PARAM_RANGES.maxFreq.min}
              max={PARAM_RANGES.maxFreq.max}
              step={100}
              disabled={disabled}
              onValueChange={([value]) => updateParam("maxFreq", value)}
              aria-label="Maximum frequency in hertz"
            />
          </div>

          {/* Frequency Scale */}
          <div className="space-y-2">
            <Label htmlFor="freq-scale-select">Frequency Scale</Label>
            <Select
              value={params.frequencyScale}
              onValueChange={(value) =>
                updateParam("frequencyScale", value as FrequencyScale)
              }
              disabled={disabled}
            >
              <SelectTrigger id="freq-scale-select" className="w-full">
                <SelectValue placeholder="Select scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logarithmic">Logarithmic</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Logarithmic matches human hearing perception
            </p>
          </div>
        </fieldset>
      </div>

      {/* Column 2: Audio Quality & Brightness */}
      <div className="space-y-4">
        {/* Audio Quality */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Audio Quality</legend>

          {/* Sample Rate */}
          <div className="space-y-2">
            <Label htmlFor="sample-rate-select">Sample Rate</Label>
            <Select
              value={String(params.sampleRate)}
              onValueChange={(value) =>
                updateParam("sampleRate", Number(value) as SampleRate)
              }
              disabled={disabled}
            >
              <SelectTrigger id="sample-rate-select" className="w-full">
                <SelectValue placeholder="Select sample rate" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_RATES.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    {rate.toLocaleString()} Hz
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Smoothing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="smoothing-slider">Smoothing</Label>
              <span className="text-muted-foreground text-sm">
                {params.smoothing}%
              </span>
            </div>
            <Slider
              id="smoothing-slider"
              value={[params.smoothing]}
              min={PARAM_RANGES.smoothing.min}
              max={PARAM_RANGES.smoothing.max}
              step={5}
              disabled={disabled}
              onValueChange={([value]) => updateParam("smoothing", value)}
              aria-label="Smoothing percentage"
            />
            <p className="text-muted-foreground text-xs">
              Reduces abrupt changes between frames
            </p>
          </div>
        </fieldset>

        {/* Brightness Mapping */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Brightness Mapping</legend>

          {/* Brightness Curve */}
          <div className="space-y-2">
            <Label htmlFor="brightness-curve-select">Brightness Curve</Label>
            <Select
              value={params.brightnessCurve}
              onValueChange={(value) =>
                updateParam("brightnessCurve", value as BrightnessCurve)
              }
              disabled={disabled}
            >
              <SelectTrigger id="brightness-curve-select" className="w-full">
                <SelectValue placeholder="Select curve" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
                <SelectItem value="logarithmic">Logarithmic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              How pixel brightness maps to volume
            </p>
          </div>

          {/* Invert Image */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="invert-switch">Invert Image</Label>
              <p className="text-muted-foreground text-xs">
                Bright pixels become quiet
              </p>
            </div>
            <Switch
              id="invert-switch"
              checked={params.invertImage}
              onCheckedChange={(checked) => updateParam("invertImage", checked)}
              disabled={disabled}
              aria-label="Invert image brightness"
            />
          </div>
        </fieldset>
      </div>
    </div>
  );
}
