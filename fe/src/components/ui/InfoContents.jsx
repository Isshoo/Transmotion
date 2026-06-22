/**
 * InfoContents.jsx
 * Centralized JSX content for all InfoPopup instances in the app.
 * Import and use within <InfoPopup title="..."> ... </InfoPopup>.
 */

/* ── Form View ───────────────────────────────────────────────── */
export const MODEL_ARCH_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      Both models are pre-trained multilingual transformers used for sequence
      classification. Choose the one that best fits your dataset language and
      performance requirements.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Aspect</th>
            <th className="col-mbert">mBERT</th>
            <th className="col-xlmr">XLM-R</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Full name</span>
            </td>
            <td>bert-base-multilingual-cased</td>
            <td>xlm-roberta-base</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Architecture</span>
            </td>
            <td>BERT (Encoder)</td>
            <td>RoBERTa (Encoder)</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Training data</span>
            </td>
            <td>Wikipedia (104 languages)</td>
            <td>CommonCrawl (100 languages, ~2.5T tokens)</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Parameters</span>
            </td>
            <td>~179M</td>
            <td>~270M</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Vocabulary</span>
            </td>
            <td>119,547 tokens (WordPiece)</td>
            <td>250,002 tokens (SentencePiece)</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Max length</span>
            </td>
            <td>512 tokens</td>
            <td>512 tokens</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Indonesian NLP</span>
            </td>
            <td>Moderate — limited Indonesian corpus</td>
            <td>Strong — large Indonesian CC data</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Speed</span>
            </td>
            <td>Faster (fewer params)</td>
            <td>Slightly slower</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Best for</span>
            </td>
            <td>Baseline experiments, faster iteration</td>
            <td>Higher accuracy, Indonesian/low-resource languages</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 <strong>Recommendation:</strong> Use <strong>XLM-R</strong> for
      Indonesian text tasks — it typically achieves higher accuracy due to its
      larger and more diverse training corpus.
    </div>
  </>
);

export const HYPERPARAM_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      Hyperparameters control how the model learns during fine-tuning. The
      defaults are already optimized for multilingual transformer models on
      typical sentiment/classification tasks.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Epochs</span>
            </td>
            <td>
              <span className="param-desc">
                Number of full passes through the training data. More epochs can
                improve accuracy but risk overfitting.
              </span>
            </td>
            <td>
              <span className="param-default">3</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Batch Size</span>
            </td>
            <td>
              <span className="param-desc">
                Number of samples processed per gradient update. Larger batches
                are faster but require more memory. Smaller batches can
                generalize better.
              </span>
            </td>
            <td>
              <span className="param-default">16</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Max Length</span>
            </td>
            <td>
              <span className="param-desc">
                Maximum number of tokens per input sequence. Sequences longer
                than this are truncated. &quot;Auto&quot; detects the 99th
                percentile token length from your dataset.
              </span>
            </td>
            <td>
              <span className="param-default">auto</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Learning Rate</span>
            </td>
            <td>
              <span className="param-desc">
                Controls how much the model weights are updated per step. Too
                high causes instability; too low causes slow convergence.
                Typical range for transformers: 1e-5 to 5e-5.
              </span>
            </td>
            <td>
              <span className="param-default">2e-5</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Optimizer</span>
            </td>
            <td>
              <span className="param-desc">
                Algorithm used to update model weights. AdamW is the standard
                for transformers — it adds weight decay to Adam for better
                regularization.
              </span>
            </td>
            <td>
              <span className="param-default">adamw</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Dropout</span>
            </td>
            <td>
              <span className="param-desc">
                Fraction of neurons randomly disabled during training. Helps
                prevent overfitting. Set to 0 to disable.
              </span>
            </td>
            <td>
              <span className="param-default">0.1</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Warmup Steps</span>
            </td>
            <td>
              <span className="param-desc">
                Number of steps to linearly increase the learning rate from 0 to
                the target value. Helps stabilize early training. Expressed as a
                ratio (0–1) of total steps.
              </span>
            </td>
            <td>
              <span className="param-default">0</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Weight Decay</span>
            </td>
            <td>
              <span className="param-desc">
                L2 regularization coefficient applied to model weights. Helps
                prevent overfitting by penalizing large weights. Applied by
                AdamW by default.
              </span>
            </td>
            <td>
              <span className="param-default">0.01</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Seed</span>
            </td>
            <td>
              {/* desc in english */}
              <span className="param-desc">
                Seed is used to initialize the model parameters and the random
                sampling process. The same Seed value will always produce the
                same sequence of random numbers, thereby ensuring the
                reproducibility of the experimental results.
              </span>
            </td>
            <td>
              <span className="param-default">42</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 The default values are well-suited for most classification tasks. Only
      adjust if you observe overfitting (reduce epochs/dropout) or slow
      convergence (increase learning rate slightly).
    </div>
  </>
);

/* ── Evaluation Metrics ──────────────────────────────────────── */
export const METRICS_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      These metrics evaluate model performance on the selected data split (Test
      or Validation set). Each metric captures a different aspect of
      classification quality.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Description</th>
            <th>Range</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Accuracy</span>
            </td>
            <td>
              <span className="param-desc">
                Proportion of correctly classified samples out of all samples.
                Simple but can be misleading on imbalanced datasets.
              </span>
            </td>
            <td>0 – 100%</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">F1 Score</span>
            </td>
            <td>
              <span className="param-desc">
                Harmonic mean of Precision and Recall. Balances both false
                positives and false negatives. Best for imbalanced class
                distributions.
              </span>
            </td>
            <td>0 – 100%</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Precision</span>
            </td>
            <td>
              <span className="param-desc">
                Of all samples predicted as positive, how many were actually
                positive? High precision = few false positives.
              </span>
            </td>
            <td>0 – 100%</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Recall</span>
            </td>
            <td>
              <span className="param-desc">
                Of all actual positive samples, how many were correctly
                identified? High recall = few false negatives.
              </span>
            </td>
            <td>0 – 100%</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">MCC</span>
            </td>
            <td>
              <span className="param-desc">
                Matthews Correlation Coefficient — a balanced measure even for
                imbalanced classes. Values near +1 indicate near-perfect
                predictions; near 0 is no better than random.
              </span>
            </td>
            <td>−1 to +1</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">ROC-AUC</span>
            </td>
            <td>
              <span className="param-desc">
                Area Under the ROC Curve — measures the model&apos;s ability to
                distinguish between classes across all classification
                thresholds. Higher is better.
              </span>
            </td>
            <td>0 – 100%</td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Mean Std</span>
            </td>
            <td>
              <span className="param-desc">
                Average standard deviation of prediction confidence scores.
                Lower values mean the model is more confident and consistent in
                its predictions.
              </span>
            </td>
            <td>↓ Lower is better</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 <strong>Tip:</strong> On imbalanced datasets, prefer{" "}
      <strong>F1 Score</strong> and <strong>MCC</strong> over Accuracy, as
      Accuracy can be misleadingly high when one class dominates.
    </div>
  </>
);

/* ── Per-Class Metrics ───────────────────────────────────────── */
export const PER_CLASS_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      Shows classification performance broken down by each individual class
      label. This helps identify which classes the model handles well and which
      it struggles with.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Class</span>
            </td>
            <td>
              <span className="param-desc">
                The label/category name from your dataset.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Precision</span>
            </td>
            <td>
              <span className="param-desc">
                Of all samples predicted as this class, what fraction were
                correct?
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Recall</span>
            </td>
            <td>
              <span className="param-desc">
                Of all actual samples of this class, what fraction did the model
                correctly identify?
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">F1-Score</span>
            </td>
            <td>
              <span className="param-desc">
                Harmonic mean of Precision and Recall for this specific class.
                The most balanced single indicator per class.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Support</span>
            </td>
            <td>
              <span className="param-desc">
                Number of actual samples of this class in the evaluated split.
                Low support means results may be less reliable.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Macro Avg</span>
            </td>
            <td>
              <span className="param-desc">
                Unweighted average across all classes — treats every class
                equally regardless of sample count. Good for detecting per-class
                imbalance.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Weighted Avg</span>
            </td>
            <td>
              <span className="param-desc">
                Average weighted by Support — classes with more samples
                contribute more. Aligns with overall Accuracy behavior.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 If Macro Avg F1 is significantly lower than Weighted Avg F1, your model
      may be performing poorly on minority classes. Consider class weighting or
      data augmentation.
    </div>
  </>
);

/* ── Confusion Matrix ────────────────────────────────────────── */
export const CONFUSION_MATRIX_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      A confusion matrix visualizes the full breakdown of predictions versus
      true labels. Each cell shows how many samples of the actual class (row)
      were predicted as a given class (column).
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Concept</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Diagonal cells</span>
            </td>
            <td>
              <span className="param-desc">
                Correct predictions — the model predicted the actual class.
                Higher diagonal values = better performance.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Off-diagonal cells</span>
            </td>
            <td>
              <span className="param-desc">
                Misclassifications — the model confused one class for another.
                Large values here indicate problematic class pairs.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Row (Actual)</span>
            </td>
            <td>
              <span className="param-desc">
                The true class label of the sample.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Column (Predicted)</span>
            </td>
            <td>
              <span className="param-desc">
                The class label assigned by the model.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Color intensity</span>
            </td>
            <td>
              <span className="param-desc">
                Darker shading indicates higher counts in that cell, making it
                easy to spot dominant prediction patterns at a glance.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 Ideally, only the main diagonal should have high values. Off-diagonal
      hot spots reveal which classes the model commonly confuses — useful for
      targeted dataset improvement.
    </div>
  </>
);

/* ── Epoch Logs ──────────────────────────────────────────────── */
export const EPOCH_LOGS_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      Per-epoch logs record how the model&apos;s training and validation
      performance evolved over each training epoch. Use this to diagnose
      overfitting, underfitting, and convergence.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Epoch</span>
            </td>
            <td>
              <span className="param-desc">
                The current training epoch number. Each epoch is one full pass
                through the training data.
              </span>
            </td>
          </tr>
          {/* <tr>
            <td>
              <span className="param-name">Train Loss</span>
            </td>
            <td>
              <span className="param-desc">
                Cross-entropy loss computed on the training set. Should
                generally decrease over epochs. A plateau may indicate
                convergence or a learning rate issue.
              </span>
            </td>
          </tr> */}
          <tr>
            <td>
              <span className="param-name">Loss</span>
            </td>
            <td>
              <span className="param-desc">
                Loss on the validation set. If Loss starts increasing while
                training, the model is overfitting.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Acc / Accuracy</span>
            </td>
            <td>
              <span className="param-desc">
                Validation accuracy at this epoch. Generally should increase
                over time.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Prec / Precision</span>
            </td>
            <td>
              <span className="param-desc">
                Validation precision — proportion of positive predictions that
                were correct.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Recall</span>
            </td>
            <td>
              <span className="param-desc">
                Validation recall — proportion of actual positives correctly
                identified.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">F1</span>
            </td>
            <td>
              <span className="param-desc">
                Validation F1 score. The best overall per-epoch indicator of
                generalization quality.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 <strong>Overfitting sign:</strong> Train Loss ↓ but Val Loss ↑ after a
      certain epoch. Consider early stopping or increasing dropout. The{" "}
      <strong>last epoch row</strong> is highlighted as the final checkpoint.
    </div>
  </>
);

/* ── Iteration Table ─────────────────────────────────────────── */
export const ITERATION_TABLE_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      The Iteration Table shows accuracy results across multiple training runs
      (iterations) for each model type, organized by data split ratio.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Concept</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Iteration</span>
            </td>
            <td>
              <span className="param-desc">
                Sequential training run number (1, 2, 3…). Each row represents
                an independent training experiment with the same configuration.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Split ratio (e.g. 80:20)</span>
            </td>
            <td>
              <span className="param-desc">
                Train : Test data split ratio used for that run. 80:20 means 80%
                training data, 20% test data.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">XLM-R columns</span>
            </td>
            <td>
              <span className="param-desc">
                Accuracy values from XLM-R models trained with each split. Click
                a cell to view that model&apos;s detail page.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">MBERT columns</span>
            </td>
            <td>
              <span className="param-desc">
                Accuracy values from mBERT models trained with each split. Click
                a cell to view that model&apos;s detail page.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Average row</span>
            </td>
            <td>
              <span className="param-desc">
                Mean accuracy across all iterations for each model/split
                combination. Use this to compare overall performance stability.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Highlighted cell</span>
            </td>
            <td>
              <span className="param-desc">
                The most recent (latest) iteration per model/split combination
                is highlighted.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 Compare <strong>Average</strong> values across splits to find the
      optimal train/test ratio for your dataset. More training data (e.g.,
      90:10) doesn&apos;t always yield the best results due to reduced test set
      diversity.
    </div>
  </>
);

/* ── Metric Comparison ───────────────────────────────────────── */
export const METRIC_COMPARISON_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      The Metric Comparison table compares the best-performing XLM-R and mBERT
      models (selected by highest Accuracy) across all key evaluation metrics.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Accuracy</span>
            </td>
            <td>
              <span className="param-desc">
                Overall correctness across all classes.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Precision</span>
            </td>
            <td>
              <span className="param-desc">
                Weighted average precision across all classes.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Recall</span>
            </td>
            <td>
              <span className="param-desc">
                Weighted average recall across all classes.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">F1-score</span>
            </td>
            <td>
              <span className="param-desc">
                Weighted average F1 — primary indicator for comparing models on
                imbalanced data.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Macro Avg</span>
            </td>
            <td>
              <span className="param-desc">
                Unweighted per-class F1 average. Reveals per-class fairness.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Weighted Avg</span>
            </td>
            <td>
              <span className="param-desc">
                Sample-count weighted F1 average. Aligns with overall accuracy.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">MCC</span>
            </td>
            <td>
              <span className="param-desc">
                Matthews Correlation Coefficient — a balanced measure robust to
                class imbalance.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">ROC-AUC</span>
            </td>
            <td>
              <span className="param-desc">
                Area under the ROC curve — class discrimination ability.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Mean Std ↓</span>
            </td>
            <td>
              <span className="param-desc">
                Average confidence standard deviation. Lower = more decisive
                predictions. This metric uses &quot;lower is better&quot; logic.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 The <strong>▲</strong> symbol marks the winning model for each metric.
      The &quot;best model&quot; is selected by highest Accuracy among all
      iterations for that model type.
    </div>
  </>
);

/* ── Per-Class Comparison ────────────────────────────────────── */
export const PER_CLASS_COMPARISON_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      Compares XLM-R and mBERT performance broken down by each class label.
      Useful for identifying which model handles specific sentiment categories
      better.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Class</span>
            </td>
            <td>
              <span className="param-desc">
                The sentiment/label category from your dataset.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Prec (Precision)</span>
            </td>
            <td>
              <span className="param-desc">
                Proportion of this-class predictions that were correct.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Rec (Recall)</span>
            </td>
            <td>
              <span className="param-desc">
                Proportion of actual this-class samples correctly identified.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">F1</span>
            </td>
            <td>
              <span className="param-desc">
                Harmonic mean of Precision and Recall. Most balanced per-class
                indicator.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Sup (Support)</span>
            </td>
            <td>
              <span className="param-desc">
                Number of actual test samples of this class. Low support
                indicates rare classes where results may be less reliable.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Winner badge</span>
            </td>
            <td>
              <span className="param-desc">
                The model with higher F1 for that class is shown as the winner.
                Ties show neither model as winner.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 Look for classes where one model significantly outperforms the other —
      this may reveal domain-specific strengths. Classes with low{" "}
      <strong>Support</strong> should be interpreted with caution.
    </div>
  </>
);

/* ── Confusion Matrix Comparison (Evaluation page) ───────────── */
export const CONFUSION_MATRIX_COMPARISON_INFO = (
  <>
    <p
      className="mb-3 text-xs leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      Side-by-side confusion matrices for the best XLM-R and mBERT models,
      allowing direct visual comparison of how each model misclassifies samples.
    </p>
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border-default)" }}
    >
      <table>
        <thead>
          <tr>
            <th>Concept</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="param-name">Rows (Actual)</span>
            </td>
            <td>
              <span className="param-desc">
                True labels — the correct class for each sample.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Columns (Predicted)</span>
            </td>
            <td>
              <span className="param-desc">
                Model&apos;s predicted class for each sample.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Diagonal</span>
            </td>
            <td>
              <span className="param-desc">
                Correct predictions — higher values on diagonal = better model.
              </span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="param-name">Off-diagonal</span>
            </td>
            <td>
              <span className="param-desc">
                Errors — the model incorrectly labeled one class as another.
                Comparing these between XLM-R and mBERT reveals which model
                makes fewer or different errors.
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="tip-box">
      💡 Compare the diagonal density between XLM-R and mBERT matrices. A more
      concentrated diagonal with lighter off-diagonal cells indicates a more
      accurate and decisive model.
    </div>
  </>
);
